import React from "react";

export default function StepDocuments({
  formData = {},
  onChange,
  readOnly,
}) {
  const documents = formData.documents || {};

  const documentFields = [
    {
      name: "resume",
      label: "Resume / CV",
    },
    {
      name: "offer_letter",
      label: "Offer Letter / Appointment Letter",
    },
    {
      name: "pan_document",
      label: "PAN Document",
    },
    {
      name: "aadhaar_document",
      label: "Aadhaar Document",
    },
    {
      name: "experience_certificate",
      label: "Experience Certificate",
    },
    {
      name: "other_document",
      label: "Other Supporting Document",
    },
  ];

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (!files || !files[0]) return;

    onChange({
      target: {
        name: `documents.${name}`,
        type: "file",
        files: files,
        value: files[0],
      },
    });
  };

  return (
    <div className="space-y-4">

      <p className="text-sm text-gray-500 mb-2">
        Upload relevant employee documents and identity attachments.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {documentFields.map((doc) => {
          const existingFile = documents[doc.name];

          const isExistingFile =
            typeof existingFile === "string" &&
            existingFile.trim() !== "";

          const isNewFile =
            existingFile instanceof File;

          return (
            <div
              key={doc.name}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50/50"
            >

              <label className="block text-xs font-semibold text-gray-700 mb-2">
                {doc.label}
              </label>

              {/* Existing saved document */}
              {isExistingFile && (
                <div className="mb-2 text-xs">
                  <span className="text-gray-500">
                    Current file:{" "}
                  </span>

                  <a
                    href={existingFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-medium"
                  >
                    View Document
                  </a>
                </div>
              )}

              {/* Newly selected document */}
              {isNewFile && (
                <div className="mb-2 text-xs text-green-600">
                  New file selected:{" "}
                  <span className="font-medium">
                    {existingFile.name}
                  </span>
                </div>
              )}

              <input
                type="file"
                name={doc.name}
                disabled={readOnly}
                onChange={handleFileChange}
                className="block w-full text-xs text-gray-500
                  file:mr-3
                  file:py-1.5
                  file:px-3
                  file:rounded-md
                  file:border-0
                  file:text-xs
                  file:font-semibold
                  file:bg-blue-50
                  file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50"
              />

            </div>
          );
        })}

      </div>
    </div>
  );
}
