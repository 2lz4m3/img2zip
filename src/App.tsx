import { useState } from 'react';
import FormGroup from '@mui/material/FormGroup';
import Container from '@mui/material/Container';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import { Button } from '@mui/material';
import JSZip from 'jszip';
import filenamifyUrl from 'filenamify-url';
import mime from 'mime-types';

function App() {
  const [input, setInput] = useState('');

  async function fetchImage(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
  }

  async function startDownload() {

    const inputLines = input.split(/\r?\n/);
    const imageUrls = inputLines.filter((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine === '') {
        return false;
      }
      try {
        new URL(trimmedLine);
      } catch (e) {
        return false;
      }
      return true;
    });

    if (imageUrls.length < 1) {
      window.alert('There are no valid URLs.');
      return;
    }

    const jsZip = new JSZip();

    const promises = [];
    for (const imageUrl of imageUrls) {
      promises.push(
        fetchImage(imageUrl).then((blob) => {
          const extension = mime.extension(blob.type);
          let filename = filenamifyUrl(imageUrl);
          if (!filename.endsWith(`.${extension}`)) {
            filename = `${filename}.${extension}`;
          }
          jsZip.file(filename, blob);
        })
      );
    }

    await Promise.all(promises);

    const zipBlob = await jsZip.generateAsync(
      {
        type: 'blob',
        compression: 'STORE'
      }
    );

    const fileUrl = URL.createObjectURL(zipBlob);
    window.open(fileUrl)
  }

  return (
    <>
      <Container maxWidth="sm" sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          img2zip
        </Typography>
        <Typography variant="body2" gutterBottom>
          Fetch the images, zip them, and download it.
        </Typography>
        <Box>
          <FormGroup sx={{ my: 2 }}>
            <TextareaAutosize
              id="input"
              minRows={8}
              maxRows={16}
              placeholder="Input"
              defaultValue=""
              onChange={(event) => {
                setInput(event.target.value);
              }}
            />
          </FormGroup>
          <Button
            variant="contained"
            onClick={() => {
              void startDownload();
            }}
          >Download</Button>
        </Box>
      </Container>
    </>
  )
}

export default App
