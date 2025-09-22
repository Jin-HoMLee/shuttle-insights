# Documentation Directory

This directory contains comprehensive documentation for the Shuttle Insights badminton analysis project.

## Available Documentation

### STARTER_PIPELINE_CHECKLIST.md
**Purpose**: Complete implementation guide for badminton shot classification  
**Description**: A comprehensive, modular checklist for building a badminton shot classification system using computer vision, pose estimation, and machine learning.

**Contents**:
- **Data Preparation**: Dataset sources, collection strategies, and organization
- **Pose Estimation**: Implementation guides for MediaPipe and MoveNet
- **Feature Engineering**: Temporal analysis and sequence processing
- **Model Development**: LSTM, CNN, and transformer architectures
- **Evaluation Metrics**: Shot classification accuracy, temporal alignment
- **Deployment**: Real-time inference and cloud deployment

**Target Audience**: 
- Developers implementing badminton analysis systems
- Researchers working on sports video analysis
- Contributors looking to extend the project capabilities

## Documentation Standards

When adding new documentation:

1. **Clear Structure**: Use consistent headers and organization
2. **Practical Examples**: Include code snippets and usage examples
3. **Dependencies**: List required packages and versions
4. **Update Frequency**: Keep documentation current with code changes
5. **Cross-References**: Link to related documentation and code

## Project Documentation Map

```
shuttle-insights/
├── README.md                     # Main project overview and quick start
├── docs/                         # Detailed implementation guides
│   ├── README.md                 # This file - documentation index
│   └── STARTER_PIPELINE_CHECKLIST.md # Complete implementation guide
├── src/                          # Core Python modules (documented)
├── modeling/                     # ML pipeline (documented)  
├── notebooks/                    # Jupyter analysis (documented)
├── browser-extension/            # Chrome extension (well documented)
├── experiments/                  # Research code (documented)
└── vertexai_model_endpoint_setup/ # Cloud deployment (documented)
```

## Contributing to Documentation

### Adding New Documentation

1. **File Naming**: Use descriptive, lowercase names with underscores
2. **Markdown Format**: Use standard Markdown with consistent formatting
3. **Code Examples**: Include working code snippets with explanations
4. **Screenshots**: Add images for UI components and workflows
5. **Links**: Use relative links for internal references

### Documentation Types

- **API Documentation**: Function and class references with examples
- **Tutorials**: Step-by-step guides for specific tasks
- **Guides**: Conceptual explanations and best practices
- **Reference**: Quick lookup for parameters and configurations

### Review Process

- Ensure accuracy of code examples
- Verify all links work correctly
- Check for typos and grammatical errors
- Validate that documentation matches current implementation

## Quick Reference

### For Users
- **Getting Started**: See main [README.md](../README.md)
- **Browser Extension**: See [browser-extension/README.md](../browser-extension/README.md)
- **Notebooks**: See [notebooks/README.md](../notebooks/README.md)

### For Developers
- **Implementation Guide**: [STARTER_PIPELINE_CHECKLIST.md](./STARTER_PIPELINE_CHECKLIST.md)
- **Module Documentation**: Check individual Python files for docstrings
- **Architecture**: See browser extension [SPLITTING_DOCUMENTATION.md](../browser-extension/SPLITTING_DOCUMENTATION.md)

### For Researchers
- **Experiments**: See [experiments/README.md](../experiments/README.md)
- **Model Pipeline**: Check [modeling/](../modeling/) directory
- **Cloud Deployment**: See [vertexai_model_endpoint_setup/README.md](../vertexai_model_endpoint_setup/README.md)

---

**Note**: This documentation is maintained alongside code changes. If you notice outdated information, please open an issue or submit a pull request with corrections.