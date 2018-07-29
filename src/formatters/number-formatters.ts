const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

export function abbreviateNumber(num){

    // what tier? (determines SI symbol)
    let tier = Math.log10(num) / 3 | 0;

    // if zero, we don't need a suffix
    if(tier === 0) return num;

    // get suffix and determine scale
    let suffix = SI_SYMBOL[tier];
    let scale = Math.pow(10, tier * 3);

    // scale the number
    let scaled = num / scale;

    // format number and add suffix
    return scaled.toFixed(1) + suffix;
}