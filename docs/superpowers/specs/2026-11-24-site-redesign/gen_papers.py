"""Build prototype/papers.js from the fetched Scholar list + links already on the site."""
import json, re, html, sys, difflib
fetch_dir, site_pubs, out = sys.argv[1], sys.argv[2], sys.argv[3]
S = json.load(open(f"{fetch_dir}/scholar_enriched.json"))
norm = lambda t: re.sub(r'[^a-z0-9]+', ' ', (t or '').lower()).strip()

# links the site already uses (the owner's own choices win)
site = {}
site_title = {}
body = open(site_pubs).read()
for part in re.split(r'<h3 class="publication-title">', body)[1:]:
    head = part[:part.find('</h3>')]
    m = re.search(r'href="([^"]+)"', head)
    title = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', head))).strip()
    if m: site[norm(title)] = m.group(1)
    site_title[norm(title)] = title

def url_for(i, title):
    if i is None: return ''
    s = S[i-1]
    for cand in (norm(title), norm(s['title'])):
        if cand in site: return site[cand]
        c = difflib.get_close_matches(cand, list(site), n=1, cutoff=0.86)
        if c: return site[c[0]]
    if s.get('doi'): return s['doi']
    if s.get('landing'): return s['landing']
    return "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=eD1O_vAAAAAJ&citation_for_view=" + s['cid']

TAGGED = {
 'build': [
  (5,  "Asclepius: An Adaptive Harness for Long-Horizon Clinical Agents", "EMNLP", 2026),
  (10, "Open-Ended Clinical Text Generation for Acute Care: Applying Reinforcement Learning with Clinically Grounded Rewards", "CHIL", 2026),
  (24, "A Large Model for Non-invasive and Personalized Management of Breast Cancer from Multiparametric MRI", "Nature Communications", 2025),
  (13, "Towards Generalizable AI in Medicine via Generalist–Specialist Collaboration", "Nature Biomedical Engineering", 2026),
  (12, "A Universal Foundation Model for Grounded Biomedical Image Interpretation", "Nature Communications", 2026),
  (8,  "An Explainable Biomedical Foundation Model via Large-Scale Concept-Enhanced Vision–Language Pretraining", "Nature Biomedical Engineering", 2026),
  (2,  "Genome-Anchored Foundation Model Embeddings Improve Molecular Prediction from Histology Images", "Nature Communications", 2026),
  (26, "A Data-Efficient Pan-Tumor Foundation Model for Oncology CT Interpretation", "arXiv", 2025),
  (20, "Large-Scale Generative Tumor Synthesis in Computed Tomography Images for Improving Tumor Recognition", "Nature Communications", 2025),
  (4,  "SimRetract: Zero-Shot Sim-to-Real Robotic Assistance for Retractor Take-Over in Open Surgery", "arXiv", 2026),
  (34, "Dia-LLaMA: Towards Large Language Model-Driven CT Report Generation", "MICCAI", 2025),
  (35, "Advancing Volumetric Medical Image Segmentation via Global-Local Masked Autoencoder", "IEEE TMI", 2025),
  (25, "Generalizable Cervical Cancer Screening via Large-Scale Pretraining and Test-Time Adaptation", "arXiv", 2025),
  (16, "Knowledge-Enhanced Explainable Prompting for Vision-Language Models", "AAAI", 2026),
  (37, "Bootstrapping Radiography Pre-training via Siamese Masked Vision-Language Modeling with Complementary Self-Distillation", "IEEE BIBM", 2024),
 ],
 'know': [
  (18, "A Clinical Environment Simulator for Dynamic AI Evaluation", "Nature Medicine", 2026),
  (9,  "Toward a Test of Medical AI Superintelligence", "Nature Medicine", 2026),
  (17, "The Doctor Will Agree With You Now: Sycophancy of Large Language Models in Multi-Turn Medical Conversations", "HeaLing Workshop", 2026),
  (11, "ReXGroundingCT: A 3D Chest CT Dataset for Segmentation of Findings from Free-Text Reports", "NEJM AI", 2026),
  (3,  "The Accuracy–Safety Trade-off of Large Reasoning Models in Clinical Diagnostics", "Nature Communications", 2026),
  (29, "Evaluation of Large Language Models as Emergency Department Revisit Predictors", "PSB", 2026),
  (33, "State-of-the-Art Text-Prompted Medical Segmentation Models Struggle to Ground Chest CT Findings", "MLHC", 2025),
  (1,  "Grounding Radiology Reports in 3D Chest CT: Results of the ReXGrounding Challenge", "arXiv", 2026),
  (73, "Profiling Medical AI Across Clinical Capabilities", "ML4H", 2026),
  (6,  "MedFrameQA: A Multi-Image Medical VQA Benchmark for Clinical Reasoning", "EMNLP", 2026),
  (30, "Automated Chest X-ray Report Generation Remains Unsolved", "PSB", 2026),
  (32, "3DReasonKnee: Advancing Grounded Reasoning in Medical Vision Language Models", "PSB", 2026),
  (31, "A Clinician-Guided Framework for Endoscopic AI: Developing PanEndoAtlas and Benchmarking Foundation Models Across the Full GI Spectrum", "PSB", 2026),
  (23, "PathBench: A Comprehensive Comparison Benchmark for Pathology Foundation Models Towards Precision Oncology", "arXiv", 2025),
 ],
 'wire': [
  (41, "ReXplain: Translating Radiology into Patient-Friendly Video Reports", "AAAI AIMedHealth", 2025),
  (28, "ED-Explain: Personalized Video Instructions for Patients Discharged from the Emergency Department", "PSB", 2026),
  (15, "The Credentialed API: Delegated Clinical Authority for AI Agents in Healthcare", "", 2026),
  (21, "VOICE: A Voice AI Agent System for Prehospital Stroke Assessment", "AIxMHC", 2025),
  (19, "International Retrospective Observational Study of Continual Learning for AI on Endotracheal Tube Placement from Chest Radiographs", "NEJM AI", 2026),
  (8,  "An Explainable Biomedical Foundation Model via Large-Scale Concept-Enhanced Vision–Language Pretraining", "Nature Biomedical Engineering", 2026),
  (46, "Development and Validation of an Interpretable Model Integrating Multimodal Information for Improving Ovarian Cancer Diagnosis", "Nature Communications", 2024),
  (16, "Knowledge-Enhanced Explainable Prompting for Vision-Language Models", "AAAI", 2026),
  (47, "XCoOp: Explainable Prompt Learning for Computer-Aided Diagnosis via Concept-Guided Context Optimization", "MICCAI", 2024),
  (49, "MICA: Towards Explainable Skin Lesion Diagnosis via Multi-Level Image-Concept Alignment", "AAAI", 2024),
  (7,  "Self-Explainable AI for Medical Image Analysis: A Survey and New Outlooks", "Information Fusion", 2026),
 ],
}
# Home page: four papers per theme (None = not on Scholar yet, no link)
THEMES = {
 'build': [TAGGED['build'][0], TAGGED['build'][3], TAGGED['build'][2], TAGGED['build'][1]],
 'know':  [TAGGED['know'][0],
           (None, "Abandonment of safe medical advice by large language models under patient resistance", "Science", "2026, in press"),
           TAGGED['know'][3], TAGGED['know'][5]],
 'wire':  [TAGGED['wire'][0], TAGGED['wire'][1], TAGGED['wire'][5], TAGGED['wire'][4]],
}
NOT_PAPERS = {27, 39, 51, 57, 59, 71}   # patent, editorial, proceedings volume, 2 abstracts, thesis
used = {i for v in TAGGED.values() for i, *_ in v}
def title_for(t):
    c = difflib.get_close_matches(norm(t), list(site_title), n=1, cutoff=0.86)
    return site_title[c[0]] if c else t
data = {k: [dict(t=title_for(t), v=v, y=y, u=url_for(i, t)) for i, t, v, y in rows] for k, rows in THEMES.items()}
rest = [i for i in range(1, len(S)+1) if i not in used and i not in NOT_PAPERS]
data['foundations_count'] = len(rest)
data['total'] = len(S)
open(out, 'w').write("window.PAPERS = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
for k in THEMES:
    print(k, len(data[k]))
    for p in data[k]: print("   ", p['y'], p['v'] or '-', '|', p['t'][:62])
print('foundations', len(rest), [S[i-1]['title'][:38] for i in rest][:40])
