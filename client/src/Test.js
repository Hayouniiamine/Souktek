import React, { useState } from 'react';

function Test() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count is {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default Test;
