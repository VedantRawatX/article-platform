    // File: src/components/shared/SharedPagination.tsx
    import React from 'react';
    import Pagination from 'react-bootstrap/Pagination';

    interface SharedPaginationProps {
      currentPage: number;
      totalPages: number;
      onPageChange: (pageNumber: number) => void;
      maxPagesToShow?: number; // Optional: how many page numbers to show directly
    }

    const SharedPagination: React.FC<SharedPaginationProps> = ({
      currentPage,
      totalPages,
      onPageChange,
      maxPagesToShow = 5, // Default to showing 5 page numbers
    }) => {
      if (totalPages <= 1) {
        return null; // Don't render pagination if only one page or no pages
      }

      const handlePageItemClicked = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
          onPageChange(pageNumber);
        }
      };

      let items = [];
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      // Adjust startPage if endPage is at the limit and there aren't enough pages to show
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      // First and Previous buttons
      items.push(
        <Pagination.First
          key="first"
          onClick={() => handlePageItemClicked(1)}
          disabled={currentPage === 1}
        />
      );
      items.push(
        <Pagination.Prev
          key="prev"
          onClick={() => handlePageItemClicked(currentPage - 1)}
          disabled={currentPage === 1}
        />
      );

      // Ellipsis at the start if needed
      if (startPage > 1) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" onClick={() => handlePageItemClicked(startPage - 1)} />);
      }

      // Page number items
      for (let number = startPage; number <= endPage; number++) {
        items.push(
          <Pagination.Item
            key={number}
            active={number === currentPage}
            onClick={() => handlePageItemClicked(number)}
          >
            {number}
          </Pagination.Item>,
        );
      }

      // Ellipsis at the end if needed
      if (endPage < totalPages) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" onClick={() => handlePageItemClicked(endPage + 1)} />);
      }

      // Next and Last buttons
      items.push(
        <Pagination.Next
          key="next"
          onClick={() => handlePageItemClicked(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      );
      items.push(
        <Pagination.Last
          key="last"
          onClick={() => handlePageItemClicked(totalPages)}
          disabled={currentPage === totalPages}
        />
      );

      return <Pagination>{items}</Pagination>;
    };

    export default SharedPagination;
    