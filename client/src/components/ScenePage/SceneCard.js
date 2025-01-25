import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function SceneCard({ scene, onDelete }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/scene/${scene.id}`, { state: { scene } });
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Tooltip title="编辑场景">
            <IconButton onClick={handleEdit} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除场景">
            <IconButton onClick={onDelete} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ pt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {scene.title_en}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {scene.title_zh}
          </Typography>
          {scene.source && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              来源：{scene.source}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default SceneCard; 