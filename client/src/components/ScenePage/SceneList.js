import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Pagination,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { scenarioApi } from '../../services/api';
import SceneCard from './SceneCard';
import AddSceneDialog from './AddSceneDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

function SceneList() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [error, setError] = useState(null);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const response = await scenarioApi.getScenarios(page);
      setScenarios(response.data.scenarios);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('获取场景列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [page]);

  const handleAddScene = async (data) => {
    try {
      setError(null);
      const response = await scenarioApi.createScenario(data);
      setOpenAddDialog(false);
      fetchScenarios();
    } catch (error) {
      console.error('创建场景失败:', error);
      if (error.response?.data?.error === '已达到场景数量上限（10个）') {
        setError(error.response.data.error);
      } else {
        setError('创建场景失败');
      }
    }
  };

  const handleDeleteScene = async () => {
    try {
      await scenarioApi.deleteScenario(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      fetchScenarios();
    } catch (error) {
      setError('删除场景失败');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">场景列表</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          添加场景
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {scenarios.map((scene) => (
              <Grid item xs={12} sm={6} md={4} key={scene.id}>
                <SceneCard
                  scene={scene}
                  onDelete={() => setDeleteDialog({ open: true, id: scene.id })}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <AddSceneDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setError(null);
        }}
        onSubmit={handleAddScene}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDeleteScene}
      />
    </Box>
  );
}

export default SceneList; 