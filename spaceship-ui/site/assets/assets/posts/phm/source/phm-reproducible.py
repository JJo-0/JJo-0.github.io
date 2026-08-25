"""Leakage-aware reference pipeline for session-based vibration data."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.decomposition import IncrementalPCA
from sklearn.preprocessing import StandardScaler

LABEL_COLUMNS = {"sensor", "speed", "weight", "session_id", "condition"}


def parse_labels(path: Path) -> dict[str, str]:
    """Replace with a validated parser for the dataset filename convention."""
    if not path.stem:
        raise ValueError(f"Empty filename: {path}")
    return {"session_id": path.stem}


def numeric_features(chunk: pd.DataFrame) -> pd.DataFrame:
    features = chunk.drop(columns=LABEL_COLUMNS, errors="ignore")
    features = features.select_dtypes(include="number")
    if features.empty:
        raise ValueError("No numeric feature columns remain")
    return features.replace([float("inf"), float("-inf")], pd.NA).dropna()


def iter_feature_chunks(paths: list[Path], chunksize: int):
    for path in paths:
        labels = parse_labels(path)
        for chunk in pd.read_csv(path, chunksize=chunksize):
            yield numeric_features(chunk.assign(**labels))


def fit_train_only(paths: list[Path], components: int, chunksize: int):
    scaler = StandardScaler()
    for features in iter_feature_chunks(paths, chunksize):
        scaler.partial_fit(features)

    ipca = IncrementalPCA(n_components=components, batch_size=chunksize)
    for features in iter_feature_chunks(paths, chunksize):
        ipca.partial_fit(scaler.transform(features))
    return scaler, ipca


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("train", nargs="+", type=Path)
    parser.add_argument("--components", type=int, default=12)
    parser.add_argument("--chunksize", type=int, default=10_000)
    parser.add_argument("--output", type=Path, default=Path("artifacts"))
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    scaler, ipca = fit_train_only(args.train, args.components, args.chunksize)
    joblib.dump(scaler, args.output / "scaler.joblib")
    joblib.dump(ipca, args.output / "ipca.joblib")
    (args.output / "metadata.json").write_text(
        json.dumps({
            "train_sessions": [path.stem for path in args.train],
            "n_components": args.components,
            "explained_variance_ratio": ipca.explained_variance_ratio_.tolist(),
        }, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()

