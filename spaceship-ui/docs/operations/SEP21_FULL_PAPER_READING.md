# September 21 — full-paper reading repair

Review base: PR #137 head `baf6feb1e3a000e7bed99798af2c73f5d1724668`.
Acquisition run: 35555535201; artifact 10619249514. The earlier `.pdf` request failures did not mean the accepted full papers were absent. Followed publisher `_reference.pdf` links and acquired MSVD 14p + supplement 62p, fiber 9p + supplement 49p, Er LED 12p + supplement 22p. Full source PDFs are review artifacts only and are not added to the published repository.

## Content changes grounded in these exact versions
- MSVD: preserve X/U/S/V notation; explain the actual Methods Eq.4 right-singular-vector subtraction with stored X and V. Normalization, scaling, subtraction and convergence control run on FPGA/CPU. The diagonal-matrix 9:1 and residual 0.59 examples are authored calculations, not device data. Preserve real 130nm arrays versus 32nm architecture estimates and LLaMA simulation.
- Fiber: Eq.1 integrates angles at fixed wavelength, not wavelength conversion. Fig.2b is k-resolved DOS; Fig.2d is measured transmission. Methods Eq.4 uses an unsquared spectral L2 norm; the earlier draft/chat squared-penalty representation is not substituted. Public code conventions remain separate. Two spatial dimensions plus wavelength used 36 rotations; 10ms tissue exposure and minutes of reconstruction are different timings. Fig.4 averages three runs of the same H&E mouse gastric tumor section; clustering is not clinical validation.
- Er LED: Fig.1 establishes material structure; Fig.2i contains the energy scheme. Distinguish donor ns and Er ms photoluminescence decays, 48h optical stability and electrically driven T50. Full manuscript reports T50 43→138min at 100mA/cm²; 36min at400mA/cm². Twelve devices: mean2.77%, SD0.36pp, peak3.26%. Removed the unsupported implication that no device-lifetime data exist. Full panel5e says3.24%, body/caption/statistics3.26%; preserved both in a small note. Donor-lifetime symbol ordering in paper Eq.1 is not silently repaired.

## Reading/engineering
Preserve original nine PNG bytes, licenses, URLs and all historical posts. Remove duplicate representative figures, replace generic English-heavy prose with a connected Korean walkthrough, write twelve actual equation explanations and inline KaTeX. Replace unused-import lint failure and weak mutation checks with validators of the authored source, symbols, arithmetic and tested renders. Native browser tests cover all figures, equations, citations and themes; added equation-number collision checks without reducing the existing suite or timeouts.

No statement here claims independent experimental reproduction, successful final CI or public deployment. Those require the new exact commit and deployment result.

## Exact source acquisition receipts
```json
{
  "msvd": [
    {
      "name": "paper",
      "url": "https://www.nature.com/articles/s41467-026-76272-2.pdf",
      "sha256": "156aa365b4cfaa4e3d1ac5238a6d8c3fdb4d26cca69ba689f5c03e374319c782",
      "pages": 14,
      "ok": true
    },
    {
      "name": "supplement",
      "url": "https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41467-026-76272-2/MediaObjects/41467_2026_76272_MOESM1_ESM.pdf",
      "sha256": "be788f45ded6a17134269d947c30c350a5f5529f377807e4fe256d544aea88b3",
      "pages": 62,
      "ok": true
    }
  ],
  "fiber": [
    {
      "name": "paper",
      "url": "https://www.nature.com/articles/s41467-026-77550-9_reference.pdf",
      "sha256": "f0b3c76a3c5bcd2c662e5cd3d92e658d10b367525d99be2b5ee7ed035f94a00b",
      "pages": 9,
      "ok": true
    },
    {
      "name": "supplement",
      "url": "https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41467-026-77550-9/MediaObjects/41467_2026_77550_MOESM1_ESM.pdf",
      "sha256": "664a984a320f8cbc998cdeab5fedddd260bcd51862bdf81f49d29502f75697ca",
      "pages": 49,
      "ok": true
    }
  ],
  "erled": [
    {
      "name": "paper",
      "url": "https://www.nature.com/articles/s41467-026-77851-z_reference.pdf",
      "sha256": "d4f15d9a675b73f56176eb4d643c53443424c6087a4406c542bb02ec3e114cd8",
      "pages": 12,
      "ok": true
    },
    {
      "name": "supplement",
      "url": "https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41467-026-77851-z/MediaObjects/41467_2026_77851_MOESM1_ESM.pdf",
      "sha256": "5860279c95a9f7301d621da8b34332669928c05e74ee4df5819acf6d3eaf4066",
      "pages": 22,
      "ok": true
    }
  ]
}
```
