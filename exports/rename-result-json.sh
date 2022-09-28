cd "$(dirname $0)"

# Rename result.json to export-<date>.json
mv result.json export-$(date +%Y%m%d).json
