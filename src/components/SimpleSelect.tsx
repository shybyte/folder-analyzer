import { For } from 'solid-js';

interface SimpleSelectProps {
  selectedValue: string;
  setSelectedValue: (newValue: string) => void;
  values: string[];
}

export function SimpleSelect(props: SimpleSelectProps) {
  return (
    <select
      onChange={(val) => {
        props.setSelectedValue(val.currentTarget.value);
      }}
    >
      <For each={props.values}>
        {(metricName) => (
          <option value={metricName} selected={metricName === props.selectedValue}>
            {metricName}
          </option>
        )}
      </For>
    </select>
  );
}
