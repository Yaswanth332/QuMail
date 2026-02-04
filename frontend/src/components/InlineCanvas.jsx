import React, { useRef, useEffect } from 'react';

const InlineCanvas = ({ bitString, color, width = 300, height = 300 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !bitString) return;
        const ctx = canvasRef.current.getContext('2d');
        const dim = Math.floor(Math.sqrt(bitString.length)); // Square grid
        const pixelSize = width / dim;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < bitString.length; i++) {
            const row = Math.floor(i / dim);
            const col = i % dim;
            if (bitString[i] === '1') {
                ctx.fillStyle = color;
                ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
            }
        }
    }, [bitString, color, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                borderRadius: '8px',
                border: '1px solid #333',
                background: '#000',
                imageRendering: 'pixelated'
            }}
        />
    );
};

export default InlineCanvas;
