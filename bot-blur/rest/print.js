let count = 0;
const printSameLine = async () => {
  process.stdout.write(`same line ${count} \r`);
};

const printNewLine = async () => {
  console.log('new line');
};

(async () => {
  while (count < 10) {
    await printSameLine();
    count++;
    if (count === 10) {
      break;
    }
    await printNewLine();
  }
})();
