from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

model = YOLO("yolov8n.pt")

@app.route("/detect", methods=["POST"])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files['image']

    try:
        image = Image.open(image_file.stream).convert("RGB")
    except Exception as e:
        return jsonify({"error": "Invalid image file"}), 400

    # Run detection
    results = model(image, conf=0.25, verbose=False)
    
    detected_objects_with_boxes = []

    for r in results:
        # Get image dimensions to normalize bounding box coordinates
        img_width, img_height = image.size
        for box in r.boxes:
            class_id = int(box.cls[0])
            label = r.names[class_id]
            
            # Get bounding box coordinates in xyxy format
            # box.xyxy is a tensor, convert to list and then to float
            x1, y1, x2, y2 = [float(coord) for coord in box.xyxy[0]]

            # Normalize coordinates to be between 0 and 1
            x1_norm = x1 / img_width
            y1_norm = y1 / img_height
            x2_norm = x2 / img_width
            y2_norm = y2 / img_height

            detected_objects_with_boxes.append({
                "label": label.lower(),
                "box": {
                    "x1": x1_norm,
                    "y1": y1_norm,
                    "x2": x2_norm,
                    "y2": y2_norm
                }
            })
            
    # To get unique labels for the eco-tips part, we can extract them here
    unique_labels = sorted(list(set([obj["label"] for obj in detected_objects_with_boxes])))

    return jsonify({
        "objects": unique_labels, # For the list of detected objects and tips
        "detections": detected_objects_with_boxes # For overlay positioning
    })

@app.route('/')
def serve_home():
    return send_from_directory('templates', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('templates', filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
