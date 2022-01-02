class MastermindBuilder {
    private static readonly MAX_TRIES_CHOOSE_WORDS = 100;

    private static _recursionCount = 0;
    private static _recursionEndCount = 0;
    private static _recursion2count = 0;
    private static _recursion2endCount = 0;

    private static _last: [string[], number[][], string] | null = null;

    private static _lastWordList: [string[], string[]] | null = null;

    private static _boardCount = 0;

    private static WORDS: string[] | null = null;

    public static readonly VOWELS = ["a","e","i","o","u"];
    public static readonly CONSONANTS = ["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","y","z"];
    public static readonly LETTERS = MastermindBuilder.VOWELS.concat(MastermindBuilder.CONSONANTS);

    private static getRandomLetters(letterNum: number): string[] {
        let vowelsNum = Math.min(Math.floor(letterNum * 0.45), this.VOWELS.length);

        let letters = Utils.shuffle(this.VOWELS).slice(0, vowelsNum);
        let consonants = Utils.shuffle(this.CONSONANTS).slice(0, letterNum - vowelsNum);
        for (let i = 0; i < consonants.length; i++) {
            letters.push(consonants[i]);
        }

        return letters;
    }

    private static loadWordList(): void {
        let xhr = new XMLHttpRequest();

        xhr.open("GET", "http://localhost/sudoku/words.txt", false);

        xhr.onload = function () {
            MastermindBuilder.WORDS = xhr.response.split("\n");
        };

        xhr.send();
    }

    /** @return [letters, words] */
    public static getWordList(letterNum: number, wordLength: number, wordNum: number): [string[], string[]] {
        if (letterNum > this.LETTERS.length) {
            throw "LogikWordlistGenerator->createWordList - letterNum > this.LETTERS";
        }

        if (this.WORDS === null) {
            this.loadWordList();
        }

        if (Math.random() < 0.05) {
            // @ts-ignore
            this.WORDS = Utils.shuffle(this.WORDS);
        }

        let words = [];
        // let tries = 0;
        let letters = this.getRandomLetters(letterNum);
        let letterSet = new Set(letters);
        while (words.length < wordNum) {
            // @ts-ignore
            for (let i = Math.floor(Math.random() / 2 * this.WORDS.length); i < this.WORDS.length; i++) {
                // @ts-ignore
                let word = this.WORDS[i];
                if (word.length === wordLength) {
                    let isOk = true;
                    for (let j = 0; j < word.length; j++) {
                        if (! letterSet.has(word[j])) {
                            isOk = false;
                        }
                    }
                    if (isOk) {
                        words.push(word);
                    }
                }
            }

            // tries ++;
        }

        // console.log("Word list generator tries -", tries);
        //
        // console.log(letters, words);

        return [letters, words];
    }

    private static orderLettersByWords(words: string[]): string[] {
        let already = new Set();
        let letters = [];
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            for (let j = 0; j < word.length; j++) {
                if (! already.has(word[j])) {
                    letters.push(word[j]);
                    already.add(word[j]);
                }
            }
        }

        return letters;
    }

    private static getWords(letterNum: number, wordLength: number, wordNum: number): [string[], string[]] | [null, null] {
        let letters, words;
        if (this._lastWordList !== null && Math.random() < 0.8) {
            [letters, words] = this._lastWordList;
        } else {
            [letters, words] = this.getWordList(letterNum, wordLength, 50);
            this._lastWordList = [letters, words];
        }

        let unusedLetters = new Set(letters);
        let chosenWords = [];
        let tries = 0;
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            if (unusedLetters.size === 0) {
                chosenWords.push(word);
            } else {
                let hasNewLetter = false;
                for (let j = 0; j < word.length; j++) {
                    if (unusedLetters.has(word[j])) {
                        hasNewLetter = true;
                        unusedLetters.delete(word[j]);
                    }
                }
                if (hasNewLetter) {
                    chosenWords.push(word);
                }
            }

            if (chosenWords.length === wordNum) {
                if (unusedLetters.size === 0) {
                    chosenWords = Utils.shuffle(chosenWords);
                    letters = this.orderLettersByWords(chosenWords);
                    return [letters, chosenWords];
                } else if (tries < this.MAX_TRIES_CHOOSE_WORDS) {
                    tries ++;
                    chosenWords = [];
                    unusedLetters = new Set(letters);
                    words = Utils.shuffle(words);
                } else {
                    return [null, null];
                }
            }
        }

        return [null, null];
    }

    private static getCode(letters: string[], wordLength: number): string {
        let codeArray = [];
        for (let i = 0; i < wordLength; i++) {
            let letter = letters[Math.floor(Math.random() * letters.length)];
            codeArray.push(letter);
        }

        return codeArray.join("");
    }

    private static stringToLetterCount(lettersNumbers: object, letterNum: number, word: string): number[] {
        let letterCount = [];
        for (let i = 0; i < letterNum; i++) {
            letterCount.push(0);
        }

        for (let i = 0; i < word.length; i++) {
            // @ts-ignore
            letterCount[lettersNumbers[word[i]]] ++;
        }

        return letterCount;
    }

    private static wordsCodeToLetterCount(letters: string[], words: string[], code: string): [number[][], number[]] {
        let lettersNumbers = {};
        for (let i = 0; i < letters.length; i++) {
            // @ts-ignore
            lettersNumbers[letters[i]] = i;
        }

        let wordsLetterCount = [];
        for (let i = 0; i < words.length; i++) {
            wordsLetterCount.push(this.stringToLetterCount(lettersNumbers, letters.length, words[i]));
        }

        let codeLetterCount = this.stringToLetterCount(lettersNumbers, letters.length, code);

        return [wordsLetterCount, codeLetterCount];
    }

    private static countBlackDots(word: string, code: string): number {
        let blackDotsNum = 0;
        for (let i = 0; i < word.length; i++) {
            if (word[i] === code[i]) {
                blackDotsNum ++;
            }
        }

        return blackDotsNum;
    }

    private static countNonzeroDots(word: number[], code: number[]): number {
        let nonzeroDotsNum = 0;
        for (let i = 0; i < word.length; i++) {
            nonzeroDotsNum += Math.min(word[i], code[i]);
        }

        return nonzeroDotsNum;
    }

    private static getTask(letters: string[], wordLength: number, words: string[], code: string): number[][] {
        let lettersNumbers = {};
        for (let i = 0; i < letters.length; i++) {
            // @ts-ignore
            lettersNumbers[letters[i]] = i;
        }

        let wordsLetterCount, codeLetterCount;
        [wordsLetterCount, codeLetterCount] = this.wordsCodeToLetterCount(letters, words, code);

        let task = [];
        for (let i = 0; i < words.length; i++) {
            let blackDotsNum = this.countBlackDots(words[i], code);
            let whiteDotsNum = this.countNonzeroDots(wordsLetterCount[i], codeLetterCount) - blackDotsNum;
            let zeroDotsNum = wordLength - blackDotsNum - whiteDotsNum;
            task.push([zeroDotsNum, whiteDotsNum, blackDotsNum]);
        }

        return task;
    }

    private static orderWordsTaskByLetters(inputWords: number[][], inputTask: number[][]): [number[][], number[][]] {
        let words: number[][] = [];
        let task: number[][] = [];
        for (let i = 0; i < inputWords.length; i++) {
            let wordAdd = inputWords[i];
            let taskAdd = inputTask[i];
            let position = i;
            if (position !== 0) {
                while (taskAdd[1] < task[position - 1][1]) {
                    position --;
                    if (position === 0) {
                        break;
                    }
                }
            }
            words.splice(position, 0, wordAdd);
            task.splice(position, 0, taskAdd);
        }

        return [words, task];
    }

    private static checkBlackDots(word: string, code: string[], wordLength: number, depth: number, blackDotsTask: number): boolean {
        let blackDotsNum = 0;
        for (let i = 0; i < depth; i++) {
            if (word[i] === code[i]) {
                blackDotsNum ++;
            }
        }

        return blackDotsNum <= blackDotsTask && blackDotsNum + wordLength - depth >= blackDotsTask;
    }

    private static bruteforceLetterOrderRecursion(
        letters: string[], wordLength: number,
        words: string[], task: number[][],
        codeLetterCount: number[],
        depth: number, activeCodeLetterCount: number[], activeCode: string[],
    ): void {
        this._recursion2count ++;

        if (this._recursion2endCount > 1) {
            return;
        }

        for (let i = 0; i < words.length; i++) {
            if (! this.checkBlackDots(words[i], activeCode, wordLength, depth, task[i][2])) {
                return;
            }
        }

        // console.log(codeLetterCount, depth, activeCodeLetterCount, activeCode);

        if (depth === wordLength) {
            this._recursion2endCount ++;
        } else {
            for (let add = 0; add < letters.length; add++) {
                if (activeCodeLetterCount[add] < codeLetterCount[add]) {
                    activeCodeLetterCount[add] ++;
                    activeCode[depth] = letters[add];

                    this.bruteforceLetterOrderRecursion(
                        letters, wordLength, words, task, codeLetterCount, depth + 1, activeCodeLetterCount, activeCode
                    );

                    activeCodeLetterCount[add] --;
                }
            }
        }
    }

    private static bruteforceLetterOrder(
        letters: string[], wordLength: number,
        words: string[], task: number[][],
        codeLetterCount: number[],
    ): void {
        let activeCode = [];
        for (let i = 0; i < wordLength; i++) {
            activeCode.push("");
        }

        let activeCodeLetterCount = [];
        for (let i = 0; i < letters.length; i++) {
            activeCodeLetterCount.push(0);
        }

        this.bruteforceLetterOrderRecursion(letters, wordLength, words, task, codeLetterCount, 0, activeCodeLetterCount, activeCode);
    }

    private static bruteforceLetterCountRecursion(
        letters: string[], wordLength: number,
        words: string[], task: number[][],
        wordsLetterCount: number[][], taskForCount: number[][],
        depth: number, codeLetterCount: number[], sum: number,
    ): void {
        this._recursionCount ++;

        if (this._recursion2endCount > 1) {
            return;
        }

        for (let i = 0; i < wordsLetterCount.length; i++) {
            if (taskForCount[i][1] === depth - 1) {
                let nonzeroDotNum = this.countNonzeroDots(wordsLetterCount[i], codeLetterCount);
                if (nonzeroDotNum !== taskForCount[i][0]) {
                    codeLetterCount[depth] = 0;
                    return;
                }
            }
        }

        if (depth === letters.length) {
            if (sum === wordLength) {
                this._recursionEndCount ++;

                this.bruteforceLetterOrder(letters, wordLength, words, task, codeLetterCount);
            }
            return;
        } else {
            for (let add = 0; add < wordLength - sum + 1; add++) {
                codeLetterCount[depth] = add;
                this.bruteforceLetterCountRecursion(
                    letters, wordLength, words, task,
                    wordsLetterCount, taskForCount, depth + 1, codeLetterCount, sum + add
                );
            }
            return;
        }
    }

    private static bruteForceLetterCount(
        letters: string[], wordLength: number, words: string[],
        inputWordsLetterCount: number[][], task: number[][],
    ): void {
        let taskLetterCount = [];
        for (let i = 0; i < task.length; i++) {
            let nonemptyDotCount = task[i][1] + task[i][2];
            let lastNonzeroLetter = 0;
            for (let j = 0; j < letters.length; j++) {
                if (inputWordsLetterCount[i][j] !== 0) {
                    lastNonzeroLetter = j;
                }
            }
            taskLetterCount.push([nonemptyDotCount, lastNonzeroLetter]);
        }

        let wordsLetterCount = Utils.deepcopyArray2d(inputWordsLetterCount);
        [wordsLetterCount, taskLetterCount] = this.orderWordsTaskByLetters(wordsLetterCount, taskLetterCount);

        let codeLetterCount = [];
        for (let i = 0; i < letters.length; i++) {
            codeLetterCount.push(0);
        }

        this._recursionCount = 0;
        this._recursionEndCount = 0;
        this._recursion2count = 0;
        this._recursion2endCount = 0;
        this.bruteforceLetterCountRecursion(
            letters, wordLength, words, task,
            wordsLetterCount, taskLetterCount, 0, codeLetterCount, 0
        );
        // console.log(this._recursionCount, this._recursionEndCount, this._recursion2count, this._recursion2endCount);
    }

    private static buildTry(letterNum: number, wordLength: number, wordNum: number): boolean {
        let words = null, letters = null;
        while (words === null || letters === null) {
            [letters, words] = this.getWords(letterNum, wordLength, wordNum);
        }

        let code = this.getCode(letters, wordLength);

        // console.log(letters, words, code);

        let task = this.getTask(letters, wordLength, words, code);

        let wordsLetterCount, codeLetterCount;
        [wordsLetterCount, codeLetterCount] = this.wordsCodeToLetterCount(letters, words, code);

        // console.log(wordsLetterCount, codeLetterCount, task);

        this.bruteForceLetterCount(letters, wordLength, words, wordsLetterCount, task);

        if (this._recursion2endCount === 1) {
            this._last = [words, task, code];
            return true;
        } else {
            return false;
        }
    }

    public static build(letterNum: number, wordLength: number, wordNum: number): [string[], number[][], string] | null {
        let success = false;
        while (! success) {
            success = this.buildTry(letterNum, wordLength, wordNum);

            if (success) {
                // @ts-ignore
                // console.log(this._last[0], this._last[1], this._last[2]);
            } else {
                return this.build(letterNum, wordLength, wordNum);
            }
        }

        if (this._last !== null) {
            let task = this._last[1];
            for (let i = 0; i < task.length; i++) {
                if (task[i][0] + task[i][1] === 0 || task[i][0] + task[i][2] === 0 || task[i][1] + task[i][2] === 0 || task[i][0] === 0) {
                    return this.build(letterNum, wordLength, wordNum);
                }
            }

            // this.render(this._last[0], this._last[1], this._last[2]);
        }

        return this._last;
    }

    private static breakPage() {
        let pageWrapper = document.getElementById("page-wrapper");
        let pageBreak = document.createElement("hr");
        pageBreak.classList.add("page-break");
        pageWrapper?.appendChild(pageBreak);
    }

    public static render(words: string[], task: number[][], code: string | null): void {
        let pageWrapper = document.getElementById("page-wrapper");

        let boardNum = this._boardCount;
        this._boardCount++;

        let boardTable = document.createElement("table");
        pageWrapper?.appendChild(boardTable);
        boardTable.classList.add("mastermind-table");
        boardTable.classList.add("mastermind-table-" + boardNum.toString());

        let wordNum = words.length;
        let wordLength = words[0].length;

        for (let y = 0; y < wordNum; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < wordLength * 2; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square-full");
                column.appendChild(squareDiv);

                if (x < wordLength) {
                    squareDiv.classList.add("square-with-text");
                    squareDiv.textContent = words[y][x].toUpperCase();
                } else if (x - wordLength < task[y][2] + task[y][1]) {
                    squareDiv.classList.add("square-outer");

                    let index = x - wordLength;

                    let squareInnerDiv = document.createElement("div");
                    squareInnerDiv.classList.add("square-inner");
                    if (index < task[y][2]) {
                        squareInnerDiv.classList.add("black-point");
                    } else {
                        squareInnerDiv.classList.add("white-point");
                    }
                    squareDiv.appendChild(squareInnerDiv);
                }
            }
        }

        let row = boardTable.insertRow();

        for (let x = 0; x < wordLength * 2; x++) {
            let column = row.insertCell();

            let squareDiv = document.createElement("div");
            squareDiv.classList.add("square-full");
            column.appendChild(squareDiv);

            if (x < wordLength) {
                squareDiv.classList.add("square-with-text");
                if (code !== null) {
                    squareDiv.textContent = code[x].toUpperCase();
                }
            } else {
                squareDiv.classList.add("square-outer");
                let squareInnerDiv = document.createElement("div");
                squareInnerDiv.classList.add("square-inner");
                squareInnerDiv.classList.add("black-point");
                squareDiv.appendChild(squareInnerDiv);
            }
        }
    }

    public static main(): void {
        for (let i = 0; i < 48; i++) {
            if (i % 8 === 0) {
                this.breakPage();
            }
            let words = MastermindBuilder.build(8, 3, 4);
            console.log(i);
        }
        for (let i = 0; i < 48; i++) {
            if (i % 6 === 0) {
                this.breakPage();
            }
            let words = MastermindBuilder.build(10, 4, 5);
            console.log(i);
        }
        for (let i = 0; i < 48; i++) {
            if (i % 3 === 0) {
                this.breakPage();
            }
            let words = MastermindBuilder.build(12, 5, 6);
            console.log(i);
        }
    }
}