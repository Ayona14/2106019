const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 9876;
const WINDOW_SIZE = 10;
const NUMBERS_URLS = {
  p: "http://20.244.56.144/test/primes",
  f: "http://20.244.56.144/test/fibo",
  e: "http://20.244.56.144/test/even",
  r: "http://20.244.56.144/test/rand",
};
const numbers_buffer = [];

app.use(bodyParser.json());

const fetchNumbers = async (numberType) => {
  const url = NUMBERS_URLS[numberType];
  if (url) {
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        return response.data.numbers || [];
      } else {
        console.error(`Error fetching numbers: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching numbers: ${error.message}`);
      return [];
    }
  } else {
    console.error(`Invalid number type: ${numberType}`);
    return [];
  }
};

const calculateAverage = (numbers) => {
  if (numbers.length > 0) {
    return numbers.reduce((acc, num) => acc + num, 0) / numbers.length;
  }
  return 0.0;
};

app.get("/numbers/:numberType", async (req, res) => {
  const { numberType } = req.params;

  const fetchedNumbers = await fetchNumbers(numberType);

  for (const num of fetchedNumbers) {
    if (!numbers_buffer.includes(num)) {
      numbers_buffer.push(num);
    }
  }

  const windowPrevState = [...numbers_buffer];
  const windowCurrState = [...numbers_buffer];

  const average =
    numbers_buffer.length >= WINDOW_SIZE
      ? calculateAverage(numbers_buffer)
      : null;

  const response = {
    windowPrevState,
    windowCurrState,
    numbers: fetchedNumbers,
    avg: average,
  };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
