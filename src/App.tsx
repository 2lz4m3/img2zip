import { useEffect, useState } from 'react';
import FormGroup from '@mui/material/FormGroup';
import Container from '@mui/material/Container';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import { Button } from '@mui/material';
import JSZip from 'jszip';
import filenamifyUrl from 'filenamify-url';
import mime from 'mime-types';
import { default as Table, Row, Status } from './Table.tsx'

function App() {
  const [input, setInput] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  function updateRow(url: string, status: Status, description?: string) {
    const row = rows.find((row) => row.url === url);
    if (row) {
      row.status = status;
      row.description = description ?? '';
    }
    setRows([...rows]);
  }

  async function digestMessage(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }

  function updateTable() {
    const inputLines = input.split(/\r?\n/);
    const inputUrls = inputLines.filter((line) => {
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

    const imageUrlsUnique = [...new Set(inputUrls)];
    if (imageUrlsUnique.length < 1) {
      setRows([]);
    }

    const newRows: Row[] = [];
    imageUrlsUnique.map((url) => {
      newRows.push(
        {
          url,
          status: 'waiting',
          description: '',
        }
      );
      setRows(newRows);
    });

    setUrls(imageUrlsUnique);
  }

  async function startDownload() {
    if (urls.length < 1) {
      window.alert('There are no valid URLs.');
      return;
    }

    const jsZip = new JSZip();

    const promises = [];
    for (const imageUrl of urls) {
      updateRow(imageUrl, 'downloading');
      promises.push((async () => {
        let response: Response;
        try {
          response = await fetch(imageUrl);
          if (!response.ok) {
            const message = 'response status code is not in 200-299';
            updateRow(imageUrl, 'failed', message);
            return Promise.reject(new Error(message));
          }
          updateRow(imageUrl, 'successful');
        } catch (error) {
          let message = 'fetch failed';
          if (error instanceof Error) {
            message = error.toString();
          }
          updateRow(imageUrl, 'failed', message);
          return Promise.reject(new Error(message));
        }
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
          const message = `not an image file type: ${blob.type}`;
          updateRow(imageUrl, 'failed', message);
          return Promise.reject(new Error(message));
        }
        const extension = mime.extension(blob.type);
        const hash = await digestMessage(imageUrl);
        let filename = filenamifyUrl(imageUrl);
        filename = filename.substring(0, 200);
        filename = `${filename}_${hash}.${extension}`;
        jsZip.file(filename, blob);
      })());
    }

    await Promise.allSettled(promises).then(async (results) => {
      const fulfilled = results.filter(result => result.status === 'fulfilled');
      if (fulfilled.length < 1) {
        window.alert('There are no valid images.');
        return;
      }
      const zipBlob = await jsZip.generateAsync(
        {
          type: 'blob',
          compression: 'STORE'
        }
      );
      const fileUrl = URL.createObjectURL(zipBlob);
      window.open(fileUrl);
    });
  }

  useEffect(() => {
    updateTable();
  }, [input]);

  return (
    <>
      <Container maxWidth="lg" sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          img2zip
        </Typography>
        <Typography variant="body2" gutterBottom>
          Fetch the images, zip them, and download it.<br />
          Depending on the configuration of the image hosting server, this tool may be restricted by your browser&aposs <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#cross-origin_network_access" target="_blank" rel="noopener noreferrer">same-origin policy</a>.
        </Typography>
        <Box>
          <FormGroup sx={{ my: 2 }}>
            <TextareaAutosize
              id="input"
              minRows={8}
              maxRows={16}
              placeholder="Input image URLs"
              defaultValue=""
              onChange={(event) => {
                setInput(event.target.value);
              }}
            />
          </FormGroup>
          <Button
            sx={{ my: 2 }}
            variant="contained"
            onClick={() => {
              void startDownload();
            }}
          >Download</Button>
          <Box sx={{ my: 2 }}>
            <Table rows={rows} />
          </Box>
        </Box>
      </Container>
    </>
  )
}

export default App
