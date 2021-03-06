const output = [];

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  output.push([dropPosition, bounciness, size, bucketLabel]);
}

function runAnalysis() {
  const testSetSize = 100;
  const k = 10;

  _.range(0, 3).forEach(feature => {
    const data = _.map(output, row => [row[feature], _.last(row)]);
    const [testSet, trainingSet] = splitDataSet(
      normalizeData(data, 1),
      testSetSize
    );

    const accuracy = _.chain(testSet)
      .filter(
        testData =>
          knn(trainingSet, _.initial(testData), k) === _.last(testData)
      )
      .size()
      .divide(testSetSize)
      .value();

    console.log(`Feature: ${feature} & Accuracy: ${accuracy}`);
  });
}

const knn = (data, targetPoint, k) => {
  return _.chain(data)
    .map(row => {
      return [distance(_.initial(row), targetPoint), _.last(row)];
    })
    .sortBy(row => row[0])
    .slice(0, k)
    .countBy(row => row[1])
    .toPairs()
    .sortBy(row => row[1])
    .last()
    .first()
    .parseInt()
    .value();
};

const distance = (pointA, pointB) => {
  return (
    _.chain(pointA)
      .zip(pointB)
      .map(([a, b]) => (a - b) ** 2)
      .sum()
      .value() ** 0.5
  );
};

const splitDataSet = (data, testCount) => {
  const shuffled = _.shuffle(data);
  const testSet = _.slice(shuffled, 0, testCount);
  const trainingSet = _.slice(shuffled, testCount);

  return [testSet, trainingSet];
};

const normalizeData = (data, featureCount) => {
  const clonedData = _.cloneDeep(data);

  for (let i = 0; i < featureCount; i++) {
    const column = _.map(clonedData, row => row[i]);

    const min = _.min(column);
    const max = _.max(column);

    for (let j = 0; j < clonedData.length; j++) {
      clonedData[j][i] = (clonedData[j][i] - min) / (max - min);
    }
  }

  return clonedData;
};
