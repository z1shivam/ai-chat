'use client';
import { Response } from '@/components/ui/shadcn-io/ai/response';
import { useEffect, useState } from 'react';

const Example = () => {
  const [content, setContent] = useState('');
 
  return (
      <div className="w-full">
      <Response className=" overflow-y-auto">
        {content}
      </Response>
    </div>
  );
};
export default Example;