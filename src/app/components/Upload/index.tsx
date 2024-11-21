import * as React from 'react';
import FileUploader from './fileuploader';
import '@aws-amplify/ui-react/styles.css';

export const PhotoFileUploader = () => {
  return (
    <>
        <FileUploader
          acceptedFileTypes={['image/*']}
          path={({ identityId }) => `protected/${identityId}/`}
          autoUpload={false}
          maxFileCount={1}
          isResumable 
        />
    </>
  );
};