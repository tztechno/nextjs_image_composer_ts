// hooks/useClientSideScript.js
import { useEffect } from 'react';

const useClientSideScript = () => {
    useEffect(() => {
        const form = document.getElementById('upload-form');

        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                const formData = new FormData(form);

                try {
                    const response = await fetch('/', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Network response was not ok');
                    }

                    window.location.reload();
                } catch (error) {
                    console.error('Error:', error);
                    alert(`An error occurred while uploading the images: ${error.message}`);
                }
            });
        }
    }, []);
};

export default useClientSideScript;
