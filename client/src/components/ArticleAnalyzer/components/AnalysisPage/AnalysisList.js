import React from 'react';
import { Box } from '@mui/material';
import AnalysisCard from "./AnalysisCard";

const AnalysisList = ({ results, articles }) => {
  return results && articles.length > 0 && articles[0].text !== '' && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {results.individualResults.map((result, index) => (
        <AnalysisCard
          key={index}
          result={{...result, 
            sentimentTranslations: results.sentimentTranslations || {}
          }}
          article={typeof articles[index] === 'string' ? articles[index] : articles[index]?.text || ''}
          index={index + 1}
        />
      ))}
    </Box>
  );
};

export default AnalysisList; 