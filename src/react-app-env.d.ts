/// <reference types="react-scripts" />
declare interface Window extends Window, Document {
  hotkeys: any;
  attachEvent?: any
}
declare interface Hotkeys extends Function{
  (key: any, option: any, method?: any): void;
  [key: string]: any;
}
declare interface Document extends Document, Window {attachEvent?: any}
declare interface Event extends KeyboardEvent, Event {srcElement: any}
