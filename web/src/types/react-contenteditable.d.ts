declare module 'react-contenteditable' {
  import { Component, HTMLAttributes } from 'react';

  export interface ContentEditableEvent {
    target: {
      value: string;
    };
  }

  export interface Props extends HTMLAttributes<HTMLElement> {
    html: string;
    disabled?: boolean;
    tagName?: string;
    className?: string;
    placeholder?: string;
    onChange?: (event: ContentEditableEvent) => void;
    onBlur?: (event: ContentEditableEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
    onKeyUp?: (event: React.KeyboardEvent<HTMLElement>) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    innerRef?: React.RefObject<HTMLElement> | ((ref: HTMLElement) => void) | any;
  }

  export default class ContentEditable extends Component<Props> {}
}
