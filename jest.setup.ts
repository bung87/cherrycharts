const originalLog = console.log.bind( console )
console.log = (text) => !text.includes('THREE') && originalLog(text);