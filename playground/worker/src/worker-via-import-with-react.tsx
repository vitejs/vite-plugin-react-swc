function MyComponent() {
  console.log("MyComponent: ", <div>Hi!</div>);
}

function printAlive(): void {
  console.log("Worker with react lives!");
  MyComponent();
}

printAlive();

export {};
