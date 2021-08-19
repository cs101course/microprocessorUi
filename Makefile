upload:
	aws s3 cp ./dist s3://cs101-tools/$(name) --recursive
