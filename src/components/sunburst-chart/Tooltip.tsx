import styles from './Tooltip.module.scss';
import { createSignal, onMount } from 'solid-js';
import { Pos2D } from '../../types';

export interface TooltipProps {
  text: string;
  container: HTMLElement;
}

export function Tooltip(props: TooltipProps) {
  const [getPos, setPos] = createSignal<Pos2D>({ x: 300, y: 300 });

  onMount(() => {
    props.container.addEventListener('mousemove', (mouseEvent) => {
      // console.log('mouseEvent:', mouseEvent);
      setPos({ x: mouseEvent.clientX, y: mouseEvent.clientY });
    });
  });

  return (
    <div class={styles.tooltip} style={{ left: `${getPos().x}px`, top: `${getPos().y}px` }}>
      {props.text}
    </div>
  );
}
