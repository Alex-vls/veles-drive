import React from 'react';
import { Pagination as MuiPagination } from '@mui/material';
import { PaginatedResponse } from '../types';

interface PaginationProps<T> {
  data: PaginatedResponse<T>;
  onPageChange: (page: number) => void;
  page: number;
}

function Pagination<T>({
  data,
  onPageChange,
  page,
}: PaginationProps<T>) {
  const totalPages = Math.ceil(data.count / 10); // Assuming 10 items per page

  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <MuiPagination
      count={totalPages}
      page={page}
      onChange={handleChange}
      color="primary"
      size="large"
      showFirstButton
      showLastButton
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 3,
        mb: 3,
      }}
    />
  );
}

export default Pagination; 