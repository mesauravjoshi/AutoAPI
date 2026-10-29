const ValidateURL = (getURL: string) => {

  if (getURL.trim().length === 0) {
    console.log(getURL);
    return false
  }

  try {
    new URL(getURL);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
export default ValidateURL