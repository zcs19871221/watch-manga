import React, { useCallback } from 'react';
import cx from 'classnames';
import styles from './feature.module.css';

export const Feature = ({
  isClicked,
  onClick,
  name,
  Icon,
}: {
  isClicked: boolean;
  onClick: (e?: any) => void;
  name: string;
  Icon: any;
}) => {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);
  return (
    <div
      className={styles.feature}
      style={{ color: isClicked ? '#007bbb' : 'white' }}
      onClick={handleClick}
    >
      <Icon className={cx(styles.icon, isClicked ? styles.selctedIcon : '')} />
      <div className={styles.featureName}>{name}</div>
    </div>
  );
};
