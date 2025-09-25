SHELL := /bin/bash

.PHONY: setup
setup:
	pyenv local 3.13.5
	python -m venv .venv_bst_export
	.venv_bst_export/bin/python -m pip install --upgrade pip
	.venv_bst_export/bin/python -m pip install -r requirements_serverless.txt

# BST Model Export targets
.PHONY: export-bst export-bst-all test-export test-cloud clean-exports

export-bst:
	python export_bst_model.py --model_type BST_CG_AP --output_dir weights/exported

export-bst-all:
	python export_bst_model.py --model_type BST_CG_AP --formats torchscript onnx --benchmark

test-export:
	python test_export_basic.py

test-cloud:
	@echo "Testing cloud deployment (requires exported models)"
	@if [ -f "weights/exported/bst_cg_ap_seq100_scripted.pt" ]; then \
		python cloud_deployment_example.py --model_path weights/exported/bst_cg_ap_seq100_scripted.pt; \
	else \
		echo "No exported models found. Run 'make export-bst' first."; \
	fi

clean-exports:
	rm -rf weights/exported/*
