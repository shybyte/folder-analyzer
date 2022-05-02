import { For } from 'solid-js';

interface SimpleSelectProps<K> {
  selectedValue: K;
  setSelectedValue: (newValue: K) => void;
  values: K[];
}

export function SimpleSelect<K extends string>(props: SimpleSelectProps<K>) {
  return (
    <select
      onChange={(val) => {
        props.setSelectedValue(val.currentTarget.value as K);
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
