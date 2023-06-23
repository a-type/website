declare module '*.worker' {
  class CustomWorker extends Worker {
    constructor();
  }

  export default CustomWorker;
}

declare module 'tumult' {
  const mod: any;
  export default mod;
}
