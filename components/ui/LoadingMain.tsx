import React from 'react';
import { motion } from 'framer-motion';

const LoadingAnimation = () => {
    return (
        <div style={styles.container}>
            <motion.div
                style={styles.circle}
                animate={{
                    y: [0, -20, 0], // Bounce up and down
                    opacity: [1, 0.5, 1], // Adjust opacity for a glowing effect
                }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity, // Loop indefinitely
                    repeatType: 'loop',
                    ease: 'easeInOut',
                }}
            />
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#282c34',
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: '#61dafb',
    },
};

export default LoadingAnimation;
