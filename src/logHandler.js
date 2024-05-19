const logHandler = (filePath) => (req, res) => {
  res.download(filePath, 'example.txt', (err) => {
    if (err) {
      console.error('Error occurred while downloading file:', err);
      res.status(500).send('Error occurred while downloading file');
    }
  });
};

export default logHandler;
