import React, { memo } from 'react';
import PropTypes from 'prop-types';
import useVirtualScroll from '../../hooks/useVirtualScroll';
import './VirtualList.css';

// Компонент виртуального списка - потому что рендерить все элементы это как пытаться удержать в памяти все пароли от всех сервисов 🤯
const VirtualList = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan,
}) => {
  // Используем хук виртуального скролла - как используем GPS вместо бумажной карты 🗺️
  const { containerRef, totalHeight, visibleItems } = useVirtualScroll({
    items,
    itemHeight,
    containerHeight,
    overscan,
  });

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className || ''}`}
      style={{ height: containerHeight }}
    >
      <div
        className="virtual-list__content"
        style={{ height: totalHeight }}
      >
        {/* Рендерим только видимые элементы - как включаем свет только в той комнате, где мы находимся 💡 */}
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="virtual-list__item"
            style={item.style}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

// PropTypes - как контракт с TypeScript, только на JavaScript 🤝
VirtualList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  })).isRequired,
  itemHeight: PropTypes.number.isRequired,
  containerHeight: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
  className: PropTypes.string,
  overscan: PropTypes.number,
};

// Мемоизация компонента - чтобы не перерисовывать его чаще, чем обновляется Windows 🪟
export default memo(VirtualList); 