# Experiments Directory

This directory contains experimental code, prototype implementations, and research notebooks for exploring new approaches to badminton video analysis.

## Current Experiments

### multipose_movenet_test/
**Purpose**: Testing MoveNet models for multi-person pose detection  
**Status**: Experimental - exploring multi-person scenarios in badminton videos

**Description**: 
Experiments with Google's MoveNet models to detect multiple people simultaneously in badminton videos. This is useful for analyzing doubles matches or coaching scenarios with multiple players visible.

**Key Areas of Investigation**:
- Multi-person pose detection accuracy
- Performance comparison between single-pose and multi-pose models
- Handling of occlusion and player interaction
- Computational efficiency for real-time analysis

## Purpose of Experiments Directory

This directory serves as a sandbox for:

1. **Research and Development**: Testing new models and approaches before integration
2. **Proof of Concepts**: Validating ideas and techniques
3. **Performance Testing**: Comparing different algorithms and configurations
4. **Feature Exploration**: Investigating new capabilities and use cases

## Guidelines for Experiments

### Adding New Experiments

1. **Create a descriptive subdirectory**: Use clear, descriptive names
2. **Include a README**: Document the experiment's purpose and status
3. **Track dependencies**: Note any special requirements or installations
4. **Document results**: Include findings, metrics, and conclusions

### Experiment Lifecycle

- **Prototype**: Initial exploration and testing
- **Validation**: Verify approach works for intended use case
- **Integration**: Move successful experiments to main codebase
- **Archive**: Keep record of completed or abandoned experiments

### Best Practices

- Keep experiments self-contained with their own documentation
- Use descriptive commit messages when adding experiment code
- Include sample data or clear instructions for reproducing results
- Document both successful and failed approaches for future reference

## Integration Path

Successful experiments should be considered for integration into:
- **Main pipeline** (`src/`): Core functionality improvements
- **Notebooks** (`notebooks/`): Interactive analysis tools
- **Browser extension**: Real-time analysis features
- **Modeling pipeline** (`modeling/`): New model architectures

## Current Research Areas

- **Multi-person pose detection**: MoveNet multi-pose capabilities
- **Real-time processing**: Optimization for live video analysis
- **Shot prediction**: Advanced temporal modeling approaches
- **Court detection**: Automatic badminton court boundary detection
- **Player tracking**: Maintaining identity across video frames

---

**Note**: Experimental code may be unstable, incomplete, or use different dependencies than the main project. Always check individual experiment documentation before running.