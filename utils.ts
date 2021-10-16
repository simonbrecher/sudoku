module Utils {
    export function countBits32(binary: number): number {
        binary -= (binary >>> 1) & 0x55555555;
        binary = (binary & 0x33333333) + ((binary >>> 2) & 0x33333333);
        binary = (binary + (binary >>> 4)) & 0x0F0F0F0F;
        binary += (binary >>> 8);
        binary += (binary >>> 16);
        return binary & 0x3F;
    }
}