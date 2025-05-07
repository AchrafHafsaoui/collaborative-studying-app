import File from "../models/file.js";

export const uploadFile = async (req, res, next) => {
    try {
        const file = new File({
            identifier: req.body.identifier,
            name: req.file.originalname,
            contentType: req.file.mimetype,
            fileID: req.file.filename,
        });

        file.save()
            .then(() => {
                return res.status(200).json({ fileID: req.file.filename });
            })
            .catch((ex) => {
                console.error('Error at file creation', ex);
                return res.status(500).json({ errors: 'Internal server error' });
            });
    } catch (ex) {
        console.error('Error at file creation', ex);
        return res.status(500).json({ errors: 'Internal server error' });
    }
};

export const downloadFile = async (req, res) => {
    try {
      const fileID = req.query.fileID;
        
      const file = process.cwd() + "/uploads/" + fileID;

      const fileData = await File.findOne({fileID: fileID});

      res.download(file, fileData.name)
    
    } catch (ex) {
      console.log(ex.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

export const getFileList = async (req, res) => {
    try {
        const identifier = req.query.identifier;
        const fileList = await File.find({identifier: identifier});
        res.json(fileList);

    } catch (ex) {
        console.error('Error at file retrieval', ex);
        return res.status(500).json({ errors: 'Internal server error' });
    }
};