    // File: src/components/shared/TopProgressBar.tsx
    import React from 'react';
    import './TopProgressBar.css'; // We'll create this CSS file next

    interface TopProgressBarProps {
      isLoading: boolean;
    }

    const TopProgressBar: React.FC<TopProgressBarProps> = ({ isLoading }) => {
      if (!isLoading) {
        return null;
      }

      return (
        <div className="top-progress-bar-container">
          <div className="top-progress-bar-indicator"></div>
        </div>
      );
    };

    export default TopProgressBar;
    