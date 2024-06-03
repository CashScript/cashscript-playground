import { useRef } from "react";

const FileUploader = ({ handleFile }) => {
  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };
  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file
  const handleChange = (event) => {
    const fileUploaded = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
      handleFile(e.target.result);
    }
    fileReader.readAsText(fileUploaded);
  };
  return (
    <div style={{alignSelf: "center", marginBottom: "6px", cursor:"pointer"}}>
      <span className="button-upload" onClick={handleClick}>
        Import Artifact
      </span>
      <img src="/importIcon.svg" style={{verticalAlign:"center", margin:"0px 5px"}} />
      <input
        type="file"
        onChange={handleChange}
        ref={hiddenFileInput}
        style={{ display: "none" }} // Make the file input element invisible
      />
    </div>
  );
};

export default FileUploader
