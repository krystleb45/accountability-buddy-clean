import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceTime?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  debounceTime = 300,
}) => {
  const [query, setQuery] = useState<string>('');
  const debounceTimer = useRef<number>();

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
      onSearch(value);
    }, debounceTime);
  };

  const triggerSearch = (): void => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search"
        className="search-input"
      />
      <button
        onClick={triggerSearch}
        aria-label="Search Button"
        className="search-button"
        disabled={!query.trim()}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
