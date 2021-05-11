export async function addAttachment(attachment: File) {
  const url = "upload url or path";
  try {
    const formData = new FormData();
    formData.append("vedlegg", attachment, attachment.name);
    // TODO: POST FormData
    // return await postFormData<Attachment>(url, klageNotFoundMessage(klageId), formData);
  } catch (error) {
    // logError(error, "Add attachment error.", { resource: url, klageId });
    throw error;
  }
}
