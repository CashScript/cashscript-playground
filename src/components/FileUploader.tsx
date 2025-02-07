import { useRef } from "react";

interface Props {
  handleFile: (fileText: string) => void
}

const FileUploader: React.FC<Props> = ({ handleFile }) => {
  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null as any);

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = () => {
    if(!hiddenFileInput?.current) return
    hiddenFileInput.current.click();
  };
  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file
  const handleChange = (event: any) => {
    const fileUploaded = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
      if(!e.target?.result) return
      handleFile(e.target.result as string);
    }
    fileReader.readAsText(fileUploaded);
  };
  return (
    <div style={{alignSelf: "center", marginBottom: "6px", cursor:"pointer"}}>
      <div onClick={handleClick}>
        <span className="button-upload">
          Import Artifact
        </span>
        <img src="/importIcon.svg" style={{verticalAlign:"center", margin:"0px 5px"}} />
      </div>
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
