import React, { useState, useRef } from 'react';
import {
  Container,
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Paper,
  Input,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { analyzeComments, clearComments } from '../../services/api';
import AnalysisResults from './AnalysisResults';
import AnalyzerHeader from './AnalyzerHeader';
import { useLocation } from 'react-router-dom';

const EXAMPLE_COMMENTS = [
  `I ordered this case for when I do not want to carry a purse. The case itself is very nice, I was expecting it to feel cheap but that's not the case at all! It fit my ID and 2 cards very well. They are a little tight in there but that makes it feel very secure. I am sure they will lose a bit as I use it. The magnets holding it together seem to be very strong and I have no worries of it coming undone. Overall very satisfied 🙌🏼`,
  `Looks nice and has a nice feel. I was disappointed to find that at most it can carry one card and my ID and that's it. I have multiple cards that I need to carry on a daily basis and wish I would of been informed better that this is made for one card and a ID and that's about it. It makes it nice and slim which I like but isn't something I can use for my life.`,
  `Honestly the Case seems to be built very well as far as the seams and durability but I will note, it's very bulky and only holds maybe 3/4 cards, I feel as though the pockets themselves need revised the license pocket doesn't fully fit the license it needs to be longer or possibly switched to the opposite side, but if you're a minimalist and don't mind taking your id out anytime you need info off of it then this case is actually pretty good but would definitely be a 5 star if it was revised a little`
];

function CommentAnalyzer() {
  const location = useLocation();
  const { scene } = location.state || { scene: { titleEn: 'Comments', titleCn: '评论' } };
  const [comments, setComments] = useState(EXAMPLE_COMMENTS.map(comment => ({ text: comment })));
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const fileInputRef = useRef(null);

  const handleAddComment = () => {
    setComments([...comments, { text: '' }]);
  };

  const handleRemoveComment = (index) => {
    const newComments = comments.filter((_, i) => i !== index);
    setComments(newComments);
  };

  const handleCommentChange = (index, value) => {
    const newComments = [...comments];
    newComments[index] = { text: value };
    setComments(newComments);
  };

  const handleSubmit = async () => {
    const validComments = comments.filter(c => c.text.trim());
    if (validComments.length === 0) {
      setSnackbar({
        open: true,
        message: '请输入至少一条评论',
        severity: 'error'
      });
      return;
    }

    if (validComments.length > 20) {
      setSnackbar({
        open: true,
        message: '一次最多只能分析20条评论，请减少评论数量',
        severity: 'error'
      });
      return;
    }

    const tooLongComments = validComments.filter(c => c.text.length > 1000);
    if (tooLongComments.length > 0) {
      setSnackbar({
        open: true,
        message: '单条评论长度不能超过1000个字符，请缩短评论内容',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    setResults(null);
    
    try {
      const data = await analyzeComments(validComments.map(c => c.text));
      setResults(data);
    } catch (error) {
      console.error('分析错误:', error);
      setSnackbar({
        open: true,
        message: error.message || '分析失败，请稍后重试',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const newComments = data
          .map(row => row[0])
          .filter(comment => comment && typeof comment === 'string' && comment.trim())
          .map(comment => ({ text: comment }));

        if (newComments.length === 0) {
          setSnackbar({
            open: true,
            message: '未在Excel文件中找到有效评论',
            severity: 'error'
          });
          return;
        }

        if (newComments.length > 20) {
          setSnackbar({
            open: true,
            message: '一次最多只能导入20条评论，请减少Excel中的评论数量',
            severity: 'error'
          });
          return;
        }

        const tooLongComments = newComments.filter(c => c.text.length > 1000);
        if (tooLongComments.length > 0) {
          setSnackbar({
            open: true,
            message: '单条评论长度不能超过1000个字符，请检查Excel中的评论内容',
            severity: 'error'
          });
          return;
        }

        setComments(prevComments => {
          if (prevComments.length + newComments.length > 20) {
            setSnackbar({
              open: true,
              message: '评论总数不能超过20条，请先清空一些现有评论',
              severity: 'error'
            });
            return prevComments;
          }
          return [...prevComments, ...newComments];
        });

        setSnackbar({
          open: true,
          message: `成功导入 ${newComments.length} 条评论`,
          severity: 'success'
        });
      } catch (error) {
        console.error('Excel解析错误:', error);
        setSnackbar({
          open: true,
          message: '无法解析Excel文件',
          severity: 'error'
        });
      }
    };

    reader.onerror = () => {
      setSnackbar({
        open: true,
        message: '读取文件失败',
        severity: 'error'
      });
    };

    reader.readAsBinaryString(file);
    event.target.value = '';
  };

  const handleClearComments = async () => {
    try {
      await clearComments();
      
      setComments([]);
      setResults(null);
      
      setSnackbar({
        open: true,
        message: '评论数据已清空',
        severity: 'success'
      });
    } catch (error) {
      console.error('清空评论数据错误:', error);
      setSnackbar({
        open: true,
        message: error.message || '清空评论数据失败',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <AnalyzerHeader 
        onUpload={handleUpload} 
        onClearCache={handleClearComments}
        sceneTitle={scene.titleCn}
      />
      <Container maxWidth="md">
        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {comments.map((comment, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    multiline
                    rows={2}
                    value={comment.text}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    placeholder={`评论 ${index + 1}`}
                    variant="outlined"
                    fullWidth
                    disabled={loading}
                  />
                  {comments.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveComment(index)}
                      disabled={loading}
                      color="error"
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddComment}
                disabled={loading}
                sx={{ alignSelf: 'flex-start' }}
              >
                添加评论
              </Button>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? '分析中...' : '分析评论'}
            </Button>
            
            {loading && (
              <Typography variant="body2" color="text.secondary">
                正在分析评论...
              </Typography>
            )}
          </Box>

          {results && <AnalysisResults results={results} comments={comments} />}

          <Input
            type="file"
            inputRef={fileInputRef}
            sx={{ display: 'none' }}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </>
  );
}

export default CommentAnalyzer; 