import { useEffect } from 'react';

const useClientSideScript = (): void => {
    useEffect(() => {
        const form = document.getElementById('upload-form') as HTMLFormElement | null;

        if (form) {
            form.addEventListener('submit', async (event: Event) => {
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
                    alert(`An error occurred while uploading the images: ${(error as Error).message}`);
                }
            });
        }
    }, []);
};

export default useClientSideScript;