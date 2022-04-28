import React, { useCallback, useState, useMemo, useEffect } from 'react';

import styles from './filter.module.css';

interface FilterHook<T = string, OPT = {}> {
  ({
    label,
    init,
    className,
    opt,
    onChange,
  }: {
    label: string;
    init?: T;
    opt?: OPT;
    className?: string;
    onChange?: (v: any) => void;
  }): [
    { Component: JSX.Element; value: T },
    { setValue: React.Dispatch<React.SetStateAction<T>> },
  ];
}

export const useInput: FilterHook = ({
  label,
  init = '',
  className = styles.defaultInputWrap,
}: {
  label: string;
  init?: string;
  className?: string;
}) => {
  const [value, setValue] = useState(init);
  const handleInput = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  const reset = useCallback(() => {
    setValue(init);
  }, [init]);
  const Component = useMemo(
    () => (
      <label className={className}>
        {label}
        <input value={value} onInput={handleInput} type='text' />
      </label>
    ),
    [className, handleInput, label, value],
  );
  return [
    { Component, value },
    { setValue, reset },
  ];
};

export const useCheckBox: FilterHook<boolean> = ({
  label,
  init = false,
  className = styles.defaultCheckBoxWrap,
  onChange,
}: {
  label: string;
  init?: boolean;
  className?: string;
  onChange?: (v: any) => void;
}) => {
  const [value, setValue] = useState(init);
  const handleInput = useCallback(
    (e) => {
      setValue(e.target.checked);
      onChange && onChange(e.target.checked);
    },
    [onChange],
  );
  const reset = useCallback(() => {
    setValue(init);
  }, [init]);
  const Component = useMemo(
    () => (
      <label className={className}>
        {label}
        <input checked={value} onChange={handleInput} type='checkbox' />
      </label>
    ),
    [className, handleInput, label, value],
  );
  return [
    { Component, value },
    { setValue, reset },
  ];
};

let id = 0;
export const useRadio = <T,>({
  label = '',
  options,
  init = options[0].value,
  className = styles.defaultCheckBoxWrap,
  onChange,
}: {
  options: { text: string; value: T }[];
  label?: string;
  onChange?: (value: any) => void;
  init?: T;
  className?: string;
}) => {
  const [value, setValue] = useState(init);
  const handleInput = useCallback(
    (e) => {
      setValue(e.target.value);
      if (onChange) {
        onChange(e.target.value);
      }
    },
    [onChange],
  );
  const reset = useCallback(() => {
    setValue(init);
  }, [init]);
  const Component = useMemo(() => {
    const name = `input_raido${id++}`;
    return (
      <label className={className}>
        {label}
        <div>
          {options.map((ee, i) => (
            <label style={i > 0 ? { marginLeft: '5px' } : {}}>
              {ee.text}
              <input
                onChange={handleInput}
                type='radio'
                value={String(ee.value)}
                name={name}
                checked={ee.value === value}
              />
            </label>
          ))}
        </div>
      </label>
    );
  }, [className, handleInput, label, options, value]);
  return [
    { Component, value },
    { setValue, reset },
  ] as [
    { Component: JSX.Element; value: T },
    { setValue: React.Dispatch<React.SetStateAction<T>>; reset: () => void },
  ];
};
export const useSelect = <T,>({
  label,
  options,
  init = options[0].value,
  className = styles.defaultCheckBoxWrap,
}: {
  options: { text: string; value: T }[];
  label: string;
  init?: T;
  className?: string;
}) => {
  const [value, setValue] = useState(init);
  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  const reset = useCallback(() => {
    setValue(init);
  }, [init]);

  useEffect(() => {
    setValue(init);
  }, [init]);
  const Component = useMemo(() => {
    return (
      <label className={className}>
        {label}
        <select
          onChange={handleChange}
          style={{ marginLeft: '5px' }}
          value={String(value)}
        >
          {options.map((ee) => (
            <option value={String(ee.value)}>{ee.text}</option>
          ))}
        </select>
      </label>
    );
  }, [className, handleChange, label, options, value]);
  return [
    { Component, value },
    { setValue, reset },
  ] as const;
};
