---
title: Essential Vocabulary
description: Study computer vision and machine learning terms with English definitions, worked examples, and a
  ten-question vocabulary quiz.
pubDate: 2024-03-17
category: vision-perception-neuroscience
subcategory: technical-vocabulary
type: interactive-guide
tags:
- technical-english
- computer-vision
- vocabulary
- quiz
researchFeatured: false
lang: en
slug: 2024-03-17-english-word
translatedPosts:
  ko-KR: 2024-03-17-english-word
translationKey: en-2024-03-17-english-word
---

<div id="quiz-section" style="display: none;">
  <h2>Computer Vision Vocabulary Quiz</h2>
  <div id="quiz-container">
    <div id="quiz-progress">Question <span id="current-question">1</span> / <span id="total-questions">10</span></div>
    <div id="question-container"></div>
    <div id="options-container"></div>
    <div id="result-message" role="status" style="display: none;"></div>
    <button id="next-btn" style="display: none;">Next question</button>
    <div id="final-score" style="display: none;"></div>
  </div>
</div>

<div id="control-buttons" style="margin-top: 20px;">
  <button id="start-quiz" onclick="startQuiz()">Start quiz</button>
  <button id="return-study" onclick="returnToStudy()" style="display: none;">Return to study</button>
</div>

<style>
#quiz-section {
  color: #212529;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

#quiz-container {
  max-width: 800px;
  margin: 0 auto;
}

#question-container {
  font-size: 1.2em;
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

#options-container .option {
  display: block;
  width: 100%;
  text-align: left;
  color: #212529;
  padding: 10px 15px;
  margin: 10px 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#options-container .option:hover:not(:disabled) {
  background: #e9ecef;
}

#options-container .option.correct {
  background: #d4edda;
  border-color: #c3e6cb;
}

#options-container .option.incorrect {
  background: #f8d7da;
  border-color: #f5c6cb;
}

#quiz-section button:not(.option), #control-buttons button {
  padding: 10px 20px;
  margin: 10px 5px;
  border: none;
  border-radius: 5px;
  background: #007bff;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

#quiz-section button:not(.option):hover, #control-buttons button:hover {
  background: #0056b3;
}

#quiz-progress {
  text-align: right;
  margin-bottom: 20px;
  color: #6c757d;
}

#result-message {
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
  text-align: center;
}

#final-score {
  text-align: center;
  font-size: 1.2em;
  margin: 20px 0;
  padding: 20px;
  background: #e9ecef;
  border-radius: 5px;
}
</style>

<script>
const vocabularyData = [
  { word: 'Perceive', type: "verb", meaning: "To notice or interpret something through the senses.", example: 'Computers can perceive subtle differences in images that humans might miss.' },
  { word: 'Perceptual', type: "adjective", meaning: "Relating to how sensory information is interpreted.", example: 'Perceptual computing aims to mimic human sensory processing.' },
  { word: 'Misperception', type: "noun", meaning: "An incorrect impression or interpretation.", example: 'Image artifacts can lead to misperception in computer vision systems.' },
  { word: 'Translucency', type: "noun", meaning: "The property of letting light through while scattering it so details appear blurred.", example: 'Processing translucency in images requires advanced rendering techniques.' },
  { word: 'Subtle', type: "adjective", meaning: "Slight or delicate enough to be hard to notice.", example: 'The algorithm can detect subtle changes in lighting conditions.' },
  { word: 'Shading', type: "noun", meaning: "Variations in brightness that show how light falls on a surface.", example: 'Proper shading analysis helps in understanding 3D structures.' },
  { word: 'Effortlessly', type: "adverb", meaning: "With little difficulty or exertion.", example: 'Modern AI systems effortlessly process thousands of images per second.' },
  { word: 'Portrait', type: "noun", meaning: "A photograph or other likeness of a person.", example: 'Face detection algorithms are crucial for portrait photography.' },
  { word: 'Rapid', type: "adjective", meaning: "Moving or happening quickly.", example: 'Rapid image processing is essential for real-time applications.' },
  { word: 'Delineate', type: "verb", meaning: "To trace an outline or describe something precisely.", example: 'The algorithm can delineate object boundaries precisely.' },
  { word: 'Causality', type: "noun", meaning: "A relationship in which one event brings about another.", example: 'Understanding causality in scene analysis improves prediction accuracy.' },
  { word: 'Radiometry', type: "noun", meaning: "The measurement of electromagnetic radiation, including visible light.", example: 'Radiometry is fundamental to understanding light behavior in images.' },
  { word: 'Inspection', type: "noun", meaning: "A close examination to check condition or quality.", example: 'Automated visual inspection systems in manufacturing.' },
  { word: 'Retail', type: "noun", meaning: "The sale of goods directly to consumers.", example: 'Computer vision enhances retail analytics and customer behavior tracking.' },
  { word: 'Warehouse', type: "noun", meaning: "A building where goods are stored.", example: 'Automated warehouse systems use computer vision for inventory management.' },
  { word: 'Logistics', type: "noun", meaning: "The planning and movement of goods through a supply chain.", example: 'Computer vision optimizes logistics operations through package tracking.' },
  { word: 'Intra-operative', type: "adjective", meaning: "Taking place during surgery.", example: 'Intra-operative imaging assists surgeons during procedures.' },
  { word: 'Morphology', type: "noun", meaning: "The study of form and structure.", example: 'Mathematical morphology is used in image processing.' },
  { word: 'Surveillance', type: "noun", meaning: "Monitoring people, objects, or places over time.", example: 'Video surveillance systems employ advanced computer vision techniques.' },
  { word: 'Stitching', type: "noun", meaning: "Joining several images to make a single image.", example: 'Panorama creation through image stitching.' },
  { word: 'Overlapping', type: "adjective", meaning: "Covering some of the same area.", example: 'Overlapping images are used in 3D reconstruction.' },
  { word: 'Bracketing', type: "noun", meaning: "Taking several exposures of the same scene at different settings.", example: 'HDR images are created using exposure bracketing.' },
  { word: 'Morphing', type: "noun", meaning: "Gradually transforming one image or shape into another.", example: 'Face morphing creates smooth transitions between images.' },
  { word: 'Meticulously', type: "adverb", meaning: "With careful attention to detail.", example: 'AI models must be meticulously trained for optimal performance.' },
  { word: 'Layer-wise, sample-wise', type: "adjective", meaning: "Applied separately to each layer or to each sample.", example: 'Neural networks are analyzed layer-wise for better understanding.' },
  { word: 'Preexisting', type: "adjective", meaning: "Already present before a particular event or step.", example: 'Preexisting models can be fine-tuned for specific tasks.' },
  { word: 'Plausible', type: "adjective", meaning: "Reasonable or believable in light of the evidence.", example: 'The system generates plausible reconstructions of 3D scenes.' },
  { word: 'Pose Forecasting', type: "noun phrase", meaning: "Predicting how the position and orientation of a body or its joints will change.", example: 'Pose forecasting is crucial for safe human-robot interaction.' },
  { word: 'Ablation', type: "noun", meaning: "Removing a component of a model to test its contribution.", example: 'Ablation studies help understand the contribution of different model components.' },
  { word: 'Endow', type: "verb", meaning: "To give someone or something a particular capability.", example: 'The new sensor endows the robot with better perceptive capabilities.' },
  { word: 'Perceptive', type: "adjective", meaning: "Quick to notice or understand something.", example: 'Perceptive robots can adapt to dynamic environments.' },
  { word: 'Harm', type: "noun or verb", meaning: "Damage or injury, or the act of causing it.", example: 'The primary goal is to prevent any harm to the human worker.' },
  { word: 'Transmission of contact wrenches', type: "noun phrase", meaning: "The transfer of forces and moments through a point or surface of contact.", example: 'Accurate transmission of contact wrenches is vital for haptic feedback.' },
  { word: 'On-the-fly', type: "adverbial phrase", meaning: "During operation, as the need arises.", example: 'The robot can adjust its path on-the-fly to avoid obstacles.' },
  { word: 'Adjacency', type: "noun", meaning: "The relationship between neighboring or directly connected elements.", example: 'Adjacency matrices are used to represent connections in a graph.' },
  { word: 'Sparse', type: "adjective", meaning: "Containing few occupied positions or few nonzero entries.", example: 'Sparse data can be challenging for some machine learning models.' },
  { word: 'Sparsity', type: "noun", meaning: "The property of having relatively few nonzero or occupied elements.", example: 'Sparsity is a desirable property in many high-dimensional datasets.' },
  { word: 'Abide', type: "verb", meaning: "To follow a rule or meet a requirement, as in “abide by.”", example: 'Robots must abide by safety protocols.' },
  { word: 'Genuine', type: "adjective", meaning: "Authentic or real.", example: 'The system aims to achieve genuine collaboration between humans and robots.' },
  { word: 'Foresee', type: "verb", meaning: "To anticipate something before it occurs.", example: 'It is difficult to foresee all possible scenarios in a complex environment.' },
  { word: 'Exploited', type: "verb (past tense or past participle)", meaning: "Made use of for a particular purpose.", example: "The robot's capabilities were fully exploited in the task." },
  { word: 'Aspect', type: "noun", meaning: "One side or feature of a subject.", example: 'Safety is a critical aspect of human-robot collaboration.' },
  { word: 'Intersection', type: "noun", meaning: "A point, region, or set of elements shared by two or more things.", example: 'The intersection of AI and robotics has led to many innovations.' },
  { word: 'Prune', type: "verb", meaning: "To trim or remove unnecessary parts.", example: 'Pruning the neural network can reduce its complexity.' },
  { word: 'Factorize', type: "verb", meaning: "To express a quantity or matrix as a product of factors.", example: 'We can factorize the matrix to understand its underlying structure.' },
  { word: 'Spectral', type: "adjective", meaning: "Relating to a spectrum, such as a range of wavelengths or eigenvalues.", example: 'Spectral analysis is used in various sensor technologies.' },
  { word: 'Coarse', type: "adjective", meaning: "Approximate or low in detail or resolution.", example: 'A coarse estimation was made initially, followed by a finer adjustment.' },
  { word: 'Sparsifying', type: "verb or adjective", meaning: "Making a representation contain fewer nonzero entries.", example: 'Sparsifying techniques are used to reduce data dimensionality.' },
  { word: 'Formalize', type: "verb", meaning: "To express an idea in a precise mathematical or logical form.", example: 'We need to formalize the problem statement before designing a solution.' },
  { word: 'Density', type: "noun", meaning: "The amount of a quantity per unit of space or another measure.", example: 'Probability density functions describe the likelihood of a continuous variable.' },
  { word: 'PDF (Probability Density Function)', type: "noun", meaning: "A function whose integral over a range gives the probability of a continuous variable falling there.", example: 'The PDF of a normal distribution is bell-shaped.' },
  { word: 'PMF (Probability Mass Function)', type: "noun", meaning: "A function that assigns a probability to each possible value of a discrete random variable.", example: 'The PMF is used for discrete random variables.' },
  { word: 'Accomplish', type: "verb", meaning: "To complete a task or achieve a goal.", example: 'The AI model was able to accomplish the task with high accuracy.' },
  { word: 'Observed', type: "adjective or past-tense verb", meaning: "Seen, measured, or recorded.", example: 'The observed data was used to train the model.' },
  { word: 'Intractable', type: "adjective", meaning: "Difficult to handle or computationally impractical to solve.", example: 'Some problems are computationally intractable.' },
  { word: 'Coefficient', type: "noun", meaning: "A factor that multiplies a variable or term.", example: 'The coefficients of the linear regression model were estimated.' },
  { word: 'Era', type: "noun", meaning: "A distinct period of time.", example: 'We are in the era of big data and artificial intelligence.' },
  { word: 'Deluge', type: "noun", meaning: "A flood or an overwhelming influx.", example: 'Researchers face a deluge of data from various sources.' },
  { word: 'Apparently', type: "adverb", meaning: "Seemingly, or as the available evidence suggests.", example: 'Apparently, the new algorithm outperforms the old one.' },
  { word: 'Sufficient', type: "adjective", meaning: "Enough to meet the stated need.", example: 'Sufficient data is required to train a robust model.' },
  { word: 'Altering', type: "verb or adjective", meaning: "Changing or modifying something.", example: 'Altering the hyperparameters can significantly affect model performance.' },
  { word: 'Ability to fix', type: "phrase", meaning: "The capacity to correct a fault or solve a problem.", example: 'The system has the ability to fix minor errors automatically.' },
  { word: 'Devising', type: "verb", meaning: "Developing or designing a method or solution.", example: 'Devising new algorithms is a key part of AI research.' },
  { word: 'Empirical', type: "adjective", meaning: "Based on observation or experiment.", example: 'Empirical results show the effectiveness of the proposed method.' },
  { word: 'Theorem', type: "noun", meaning: "A mathematical or logical statement established by proof.", example: "The Bayes' theorem is fundamental in probability theory." },
  { word: 'Criterion', type: "noun", meaning: "A standard for making a judgment. Its plural is “criteria.”", example: 'Accuracy is a common criterion for evaluating classification models.' },
  { word: 'Impose', type: "verb", meaning: "To apply or enforce a condition, rule, or constraint.", example: 'We can impose constraints on the optimization problem.' },
  { word: 'Regularization', type: "noun", meaning: "A technique that penalizes or restricts a model to reduce overfitting.", example: 'Regularization helps prevent overfitting in machine learning models.' },
  { word: 'Implicitly', type: "adverb", meaning: "In a way that is implied or learned without being stated directly.", example: 'The model implicitly learns features from the data.' },
  { word: 'Explicitly', type: "adverb", meaning: "In a way that is stated directly and clearly.", example: 'Some parameters need to be explicitly defined.' },
  { word: 'Preferences', type: "noun", meaning: "Choices or outcomes that someone favors over others.", example: 'The recommendation system learns user preferences over time.' },
  { word: 'Validation', type: "noun", meaning: "Checking whether a result or a model meets the intended requirements.", example: 'Cross-validation is used to assess model performance.' },
  { word: 'Problematic', type: "adjective", meaning: "Likely to cause difficulties or raise concerns.", example: 'Handling missing data can be problematic.' },
  { word: 'Associate', type: "verb", meaning: "To connect one thing with another.", example: 'The goal is to associate input features with output labels.' },
  { word: 'Evaluations', type: "noun", meaning: "Assessments of quality, performance, or effectiveness.", example: 'Multiple evaluations were conducted to ensure robustness.' },
  { word: 'Converge', type: "verb", meaning: "To approach a common point or a limiting value.", example: 'The optimization algorithm should converge to a good solution.' },
  { word: 'Convex', type: "adjective", meaning: "Describing a set containing the segment between any two of its points, or a function whose graph lies below its chords.", example: 'Convex optimization problems are generally easier to solve.' },
  { word: 'Inventing', type: "verb", meaning: "Creating or developing something new.", example: 'Inventing new algorithms for efficient image processing.' },
  { word: 'Revising', type: "verb", meaning: "Editing or reworking an existing text or design.", example: 'Revising the methodology section of the research paper.' },
  { word: 'Drafting', type: "verb", meaning: "Writing an initial version.", example: 'Drafting the experimental results section.' },
  { word: 'Vector', type: "noun", meaning: "A mathematical object with magnitude and direction, commonly represented by an ordered list of numbers.", example: 'A vector can represent a point in space or a direction.' },
  { word: 'Matrix', type: "noun", meaning: "A rectangular array of numbers arranged in rows and columns.", example: 'A matrix can be used to transform vectors in space.' },
  { word: 'Inner Product (Dot Product)', type: "noun", meaning: "An operation on two vectors that produces a scalar and can measure their alignment or similarity.", example: 'The dot product of two orthogonal vectors is zero.' },
  { word: 'Outer Product', type: "noun", meaning: "An operation that multiplies a column vector by a row vector to produce a matrix.", example: 'The outer product of two vectors results in a matrix.' },
  { word: 'Matrix-Vector Product', type: "noun", meaning: "Multiplying a matrix by a vector produces a vector, a linear combination of the columns of the matrix.", example: 'Matrix-vector multiplication is common in linear algebra.' },
  { word: 'Matrix-Matrix Product', type: "noun", meaning: "Multiplying two matrices of compatible dimensions to obtain another matrix.", example: 'Matrix-matrix multiplication is used in many algorithms.' },
  { word: 'Identity Matrix', type: "noun", meaning: "A square matrix with ones on its main diagonal and zeros elsewhere. It acts as the multiplicative identity.", example: 'Multiplying by the identity matrix leaves a matrix unchanged.' },
  { word: 'Diagonal Matrix', type: "noun", meaning: "A square matrix whose entries off the main diagonal are zero.", example: 'A diagonal matrix has nonzero entries only on its main diagonal.' },
  { word: 'Transpose', type: "noun", meaning: "The matrix obtained by exchanging rows and columns, written Aᵀ.", example: 'The transpose of a matrix swaps its rows and columns.' },
  { word: 'Symmetric Matrix', type: "noun", meaning: "A square matrix equal to its transpose, A = Aᵀ.", example: 'A symmetric matrix is equal to its transpose.' },
  { word: 'Trace', type: "noun", meaning: "The sum of the entries on the main diagonal of a square matrix, written tr(A).", example: 'The trace of a matrix is the sum of its diagonal elements.' },
  { word: 'Norm', type: "noun", meaning: "A function that measures the size of a vector or matrix. Examples include the L1, L2, infinity, and Frobenius norms.", example: 'The L2 norm measures the Euclidean length of a vector.' },
  { word: 'Linear Independence', type: "noun", meaning: "The property that no vector in a collection can be written as a linear combination of the others.", example: 'Linearly independent vectors cannot be written as combinations of each other.' },
  { word: 'Rank', type: "noun", meaning: "The maximum number of linearly independent rows or columns of a matrix. It gives the dimension of its image.", example: 'The rank of a matrix is the dimension of its column space.' },
  { word: 'Invertible (Non-singular) Matrix', type: "noun", meaning: "A square matrix for which an inverse exists.", example: 'An invertible matrix has a nonzero determinant.' },
  { word: 'Inverse Matrix', type: "noun", meaning: "The unique matrix A⁻¹ that gives the identity when multiplied by A on either side.", example: 'The inverse of a matrix undoes its transformation.' },
  { word: 'Orthogonal Vectors', type: "noun", meaning: "Two vectors whose inner product is zero. In Euclidean space their directions are perpendicular.", example: 'Orthogonal vectors are perpendicular to each other.' },
  { word: 'Normalized Vector', type: "noun", meaning: "A vector scaled to have an L2 norm of one.", example: 'A normalized vector has unit length.' },
  { word: 'Orthogonal Matrix', type: "noun", meaning: "A real square matrix U with orthonormal columns, so UᵀU = UUᵀ = I and its inverse equals its transpose.", example: 'The inverse of an orthogonal matrix is its transpose.' },
  { word: 'Determinant', type: "noun", meaning: "A scalar for a square matrix whose magnitude gives the volume scale factor of its linear transformation. It is zero for a singular matrix.", example: 'A zero determinant means the matrix is singular.' },
  { word: 'Quadratic Form', type: "noun", meaning: "A scalar expression of the form xᵀAx, where A is square and x is a vector.", example: 'Quadratic forms are used in optimization.' },
  { word: 'Positive Definite (PD) Matrix', type: "noun", meaning: "A real symmetric matrix A for which xᵀAx > 0 for every nonzero vector x.", example: 'A positive definite matrix has all positive eigenvalues.' },
  { word: 'Positive Semidefinite (PSD) Matrix', type: "noun", meaning: "A real symmetric matrix A for which xᵀAx ≥ 0 for every vector x.", example: 'A positive semidefinite matrix has nonnegative eigenvalues.' },
  { word: 'Eigenvalue', type: "noun", meaning: "A scalar λ for which Ax = λx for some nonzero vector x. Multiplying by A scales that vector by λ.", example: 'Eigenvalues describe the scaling factor of eigenvectors.' },
  { word: 'Eigenvector', type: "noun", meaning: "A nonzero vector x satisfying Ax = λx for its associated eigenvalue λ.", example: 'Eigenvectors remain in the same direction after transformation.' },
  { word: 'Gradient', type: "noun", meaning: "The vector of first partial derivatives, ∇f(x). It points in the direction of steepest increase when it is nonzero.", example: 'The gradient points in the direction of steepest ascent.' },
  { word: 'Hessian', type: "noun", meaning: "The matrix of second partial derivatives, ∇²f(x). It describes local curvature and helps assess convexity or concavity.", example: 'The Hessian matrix is used in second-order optimization.' },
  { word: 'Random Variable', type: "noun", meaning: "A function that assigns a numerical value to each outcome of an experiment.", example: 'A random variable assigns a number to each outcome.' },
  { word: 'Cumulative Distribution Function (CDF)', type: "noun", meaning: "The probability that X is at most x, written F_X(x) = P(X ≤ x).", example: 'The CDF gives the probability that a variable is less than or equal to a value.' },
  { word: 'Probability Density Function (PDF)', type: "noun", meaning: "A function describing an absolutely continuous distribution. Where the derivative exists, p_X(x) = dF_X(x)/dx.", example: 'The PDF describes the likelihood of a continuous variable.' },
  { word: 'Independent Random Variables', type: "noun", meaning: "Variables whose joint distribution factors into the product of their marginal distributions.", example: 'Independent random variables do not influence each other.' },
  { word: 'Expected Value (Mean)', type: "noun", meaning: "The average under the probability distribution. For a continuous variable, E[X] = ∫ x p_X(x) dx when the expectation exists.", example: 'The expected value is the long-run average outcome.' },
  { word: 'Variance', type: "noun", meaning: "A measure of dispersion around the mean, Var(X) = E[|X − E[X]|²].", example: 'Variance measures the spread of a distribution.' },
  { word: 'Correlation', type: "noun", meaning: "A measure of association between two random variables. In the signal-processing convention used here, the uncentered correlation is E[XY*], where * denotes complex conjugation.", example: 'Correlation quantifies the linear relationship between variables.' },
  { word: 'Covariance', type: "noun", meaning: "A measure of how two variables vary together, Cov(X,Y) = E[(X − E[X])(Y − E[Y])*].", example: 'Covariance measures how two variables change together.' },
  { word: 'Random Vector', type: "noun", meaning: "A vector whose entries are random variables.", example: 'A random vector consists of multiple random variables.' },
  { word: 'Multivariate Gaussian (Normal) Distribution', type: "noun", meaning: "A joint normal distribution for several variables, specified by a mean vector and a covariance matrix.", example: 'The multivariate normal distribution is defined by a mean vector and covariance matrix.' },
  { word: 'Jointly Gaussian Random Vector', type: "noun", meaning: "A random vector for which every linear combination of its entries is Gaussian. Gaussian marginal distributions alone do not guarantee this property.", example: 'Jointly Gaussian vectors remain Gaussian under linear transformation.' },
  { word: 'Random Process', type: "noun", meaning: "A family of random variables indexed by time or space. This guide considers processes on a two-dimensional discrete spatial grid.", example: 'A random process describes how a system evolves over time.' },
  { word: 'Power Spectrum (Power Spectral Density)', type: "noun", meaning: "The discrete-space Fourier transform of the autocorrelation of a wide-sense stationary random process. It describes how power is distributed across spatial frequencies.", example: 'The power spectrum shows the frequency content of a process.' },
  { word: 'Loss Function', type: "noun", meaning: "A function L(D(x), y) that measures the discrepancy between a model prediction D(x) and a target y.", example: 'The loss function measures prediction error.' },
  { word: 'Supervised Learning', type: "noun", meaning: "Training a model on examples that pair inputs x with known targets y.", example: 'Supervised learning uses labeled data for training.' },
  { word: 'Empirical Loss Function', type: "noun", meaning: "The average or sum of losses on observed training samples, used to approximate loss under the data distribution.", example: 'Empirical loss is computed over the training dataset.' },
  { word: 'Gradient Descent', type: "noun", meaning: "An optimization method that moves in the direction of the negative gradient to seek a local minimum.", example: 'Gradient descent is used to minimize loss functions.' },
  { word: 'Learning Rate (Step Size)', type: "noun", meaning: "The factor that scales the gradient at each update and therefore controls the size of the step.", example: 'The learning rate controls the step size in optimization.' },
  { word: 'Stochastic Gradient Descent (SGD)', type: "noun", meaning: "An optimization method that updates parameters using a gradient estimated from a randomly sampled example or mini-batch.", example: 'SGD updates model parameters using random mini-batches.' },
  { word: 'Batch Size', type: "noun", meaning: "The number of examples used for each parameter update in mini-batch training.", example: 'Batch size determines how many samples are used per update.' },
  { word: 'Local Minimum', type: "noun", meaning: "A point whose function value is no greater than the values at nearby points. A zero gradient and a positive definite Hessian give a sufficient condition for a strict local minimum.", example: 'A local minimum is a point where the function value is lower than nearby points.' },
  { word: 'Overfitting', type: "noun", meaning: "Fitting the training data so closely that performance on new data suffers.", example: 'Overfitting occurs when a model learns noise instead of the signal.' },
  { word: 'Underfitting', type: "noun", meaning: "Failing to capture the underlying pattern, resulting in poor performance on both training and test data.", example: 'Underfitting means the model is too simple to capture the data patterns.' },
  { word: 'Regularization', type: "noun", meaning: "A modification to the learning procedure that discourages overfitting and can improve generalization.", example: 'Regularization helps prevent overfitting.' },
  { word: 'No Free Lunch Theorem', type: "noun", meaning: "A result showing that no single learning algorithm performs best across all possible problems without assumptions about the problems.", example: 'The no free lunch theorem states that no algorithm is best for all problems.' },
  { word: 'Cross-Validation', type: "noun", meaning: "Estimating generalization by splitting data into folds and rotating which folds are used for training and evaluation.", example: 'Cross-validation is used to estimate model performance.' },
  { word: 'Classification', type: "noun", meaning: "Assigning an input to one of a predefined set of classes.", example: 'Classification assigns inputs to discrete categories.' },
  { word: 'Regression', type: "noun", meaning: "Predicting a continuous numerical output from input data.", example: 'Regression predicts continuous values.' },
  { word: 'Density Estimation', type: "noun", meaning: "Modeling or estimating the probability distribution of observed data.", example: 'Density estimation models the probability distribution of data.' },
  { word: 'Object Detection', type: "noun", meaning: "Locating objects in an image or video and identifying their classes, often combining localization by regression with classification.", example: 'Object detection locates and classifies objects in images.' },
  { word: 'Self-Supervised Learning', type: "noun", meaning: "Training on a signal constructed from the input data itself, without manually supplied target labels.", example: 'Self-supervised learning uses the data itself to generate labels.' },
];

let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateQuestionTypes() {
  const types = [
    { type: 'meaning', question: 'What does this term mean?' },
    { type: 'word', question: 'Which term matches this definition?' },
    { type: 'type', question: 'How is this term used grammatically?' },
    { type: 'example', question: 'Which term completes this sentence?' }
  ];
  return shuffleArray(types);
}

function generateQuestion(vocab, questionType) {
  const question = {
    type: questionType.type,
    questionText: questionType.question,
    correctAnswer: '',
    options: []
  };

  const terms = vocabularyData.map(entry => entry.word);
  let candidates;
  switch (questionType.type) {
    case 'meaning':
      question.word = vocab.word;
      question.correctAnswer = vocab.meaning;
      candidates = vocabularyData.filter(entry => entry.word !== vocab.word).map(entry => entry.meaning);
      break;
    case 'type':
      question.word = vocab.word;
      question.correctAnswer = vocab.type;
      candidates = vocabularyData.map(entry => entry.type);
      break;
    case 'example': {
      const index = vocab.example.toLowerCase().indexOf(vocab.word.toLowerCase());
      if (index >= 0) {
        question.example = vocab.example.slice(0, index) + '_____' + vocab.example.slice(index + vocab.word.length);
      } else {
        question.type = 'word';
        question.questionText = 'Which term matches this definition?';
        question.meaning = vocab.meaning;
      }
      question.correctAnswer = vocab.word;
      candidates = terms;
      break;
    }
    case 'word':
      question.meaning = vocab.meaning;
      question.correctAnswer = vocab.word;
      candidates = terms;
      break;
  }
  const distractors = [...new Set(candidates)].filter(value => value !== question.correctAnswer);
  question.options = shuffleArray([question.correctAnswer, ...shuffleArray(distractors).slice(0, 3)]);
  return question;
}

function startQuiz() {
  document.getElementById('quiz-progress').style.display = '';
  document.getElementById('question-container').style.display = '';
  document.getElementById('options-container').style.display = '';
  document.getElementById('final-score').style.display = 'none';
  document.getElementById('study-section').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  document.getElementById('start-quiz').style.display = 'none';
  document.getElementById('return-study').style.display = 'inline-block';

  currentQuestionIndex = 0;
  score = 0;
  currentQuestions = [];

  const selectedVocab = shuffleArray([...vocabularyData]).slice(0, 10);
  const questionTypes = generateQuestionTypes();

  selectedVocab.forEach((vocab, index) => {
    const questionType = questionTypes[index % questionTypes.length];
    currentQuestions.push(generateQuestion(vocab, questionType));
  });

  showQuestion();
}

function showQuestion() {
  const question = currentQuestions[currentQuestionIndex];
  const questionContainer = document.getElementById('question-container');
  const optionsContainer = document.getElementById('options-container');

  document.getElementById('current-question').textContent = currentQuestionIndex + 1;
  document.getElementById('total-questions').textContent = currentQuestions.length;

  let questionText = question.questionText + '<br>';
  switch (question.type) {
    case 'meaning':
      questionText += `<strong>${question.word}</strong>`;
      break;
    case 'word':
      questionText += `<strong>${question.meaning}</strong>`;
      break;
    case 'type':
      questionText += `<strong>${question.word}</strong>`;
      break;
    case 'example':
      questionText += `<strong>${question.example}</strong>`;
      break;
  }
  questionContainer.innerHTML = questionText;

  optionsContainer.innerHTML = '';
  question.options.forEach(option => {
    const optionButton = document.createElement('button');
    optionButton.type = 'button';
    optionButton.className = 'option';
    optionButton.textContent = option;
    optionButton.onclick = () => checkAnswer(option);
    optionsContainer.appendChild(optionButton);
  });

  document.getElementById('result-message').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
}

function checkAnswer(selectedAnswer) {
  const question = currentQuestions[currentQuestionIndex];
  const resultMessage = document.getElementById('result-message');
  const nextButton = document.getElementById('next-btn');
  const options = document.querySelectorAll('#options-container .option');

  options.forEach(option => {
    option.disabled = true;
    if (option.textContent === question.correctAnswer) {
      option.classList.add('correct');
    }
    if (option.textContent === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      option.classList.add('incorrect');
    }
  });

  if (selectedAnswer === question.correctAnswer) {
    score++;
    resultMessage.style.backgroundColor = '#d4edda';
    resultMessage.style.color = '#155724';
    resultMessage.textContent = 'Correct! 🎉';
  } else {
    resultMessage.style.backgroundColor = '#f8d7da';
    resultMessage.style.color = '#721c24';
    resultMessage.textContent = `The correct answer is “${question.correctAnswer}”.`;
  }

  resultMessage.style.display = 'block';
  nextButton.style.display = 'block';
  nextButton.onclick = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      currentQuestionIndex++;
      showQuestion();
    } else {
      showFinalScore();
    }
  };
}

function showFinalScore() {
  for (const id of ['quiz-progress', 'question-container', 'options-container', 'result-message', 'next-btn']) {
    document.getElementById(id).style.display = 'none';
  }
  const finalScore = document.getElementById('final-score');
  const percentage = (score / currentQuestions.length) * 100;
  finalScore.style.display = 'block';
  finalScore.innerHTML = `
    <h3>Quiz complete!</h3>
    <p>Your score: ${score} / ${currentQuestions.length} (${percentage.toFixed(1)}%)</p>
    <button type="button" onclick="startQuiz()">Try again</button>
  `;
}

function returnToStudy() {
  document.getElementById('study-section').style.display = 'block';
  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('start-quiz').style.display = 'inline-block';
  document.getElementById('return-study').style.display = 'none';
}
</script>


<div id="study-section">

## Core Concepts and Terminology

### 1. Perception and Processing
- **Perceive** (verb): To notice or interpret something through the senses.
  - Example: Computers can perceive subtle differences in images that humans might miss.

- **Perceptual** (adjective): Relating to how sensory information is interpreted.
  - Example: Perceptual computing aims to mimic human sensory processing.

- **Misperception** (noun): An incorrect impression or interpretation.
  - Example: Image artifacts can lead to misperception in computer vision systems.

### 2. Visual Properties
- **Translucency** (noun): The property of letting light through while scattering it so details appear blurred.
  - Example: Processing translucency in images requires advanced rendering techniques.

- **Subtle** (adjective): Slight or delicate enough to be hard to notice.
  - Example: The algorithm can detect subtle changes in lighting conditions.

- **Shading** (noun): Variations in brightness that show how light falls on a surface.
  - Example: Proper shading analysis helps in understanding 3D structures.

### 3. Image Analysis
- **Effortlessly** (adverb): With little difficulty or exertion.
  - Example: Modern AI systems effortlessly process thousands of images per second.

- **Portrait** (noun): A photograph or other likeness of a person.
  - Example: Face detection algorithms are crucial for portrait photography.

- **Rapid** (adjective): Moving or happening quickly.
  - Example: Rapid image processing is essential for real-time applications.

### 4. Technical Processes
- **Delineate** (verb): To trace an outline or describe something precisely.
  - Example: The algorithm can delineate object boundaries precisely.

- **Causality** (noun): A relationship in which one event brings about another.
  - Example: Understanding causality in scene analysis improves prediction accuracy.

- **Radiometry** (noun): The measurement of electromagnetic radiation, including visible light.
  - Example: Radiometry is fundamental to understanding light behavior in images.

### 5. Industrial Applications
- **Inspection** (noun): A close examination to check condition or quality.
  - Example: Automated visual inspection systems in manufacturing.

- **Retail** (noun): The sale of goods directly to consumers.
  - Example: Computer vision enhances retail analytics and customer behavior tracking.

- **Warehouse** (noun): A building where goods are stored.
  - Example: Automated warehouse systems use computer vision for inventory management.

- **Logistics** (noun): The planning and movement of goods through a supply chain.
  - Example: Computer vision optimizes logistics operations through package tracking.

### 6. Advanced Applications
- **Intra-operative** (adjective): Taking place during surgery.
  - Example: Intra-operative imaging assists surgeons during procedures.

- **Morphology** (noun): The study of form and structure.
  - Example: Mathematical morphology is used in image processing.

- **Surveillance** (noun): Monitoring people, objects, or places over time.
  - Example: Video surveillance systems employ advanced computer vision techniques.

### 7. Image Processing Techniques
- **Stitching** (noun): Joining several images to make a single image.
  - Example: Panorama creation through image stitching.

- **Overlapping** (adjective): Covering some of the same area.
  - Example: Overlapping images are used in 3D reconstruction.

- **Bracketing** (noun): Taking several exposures of the same scene at different settings.
  - Example: HDR images are created using exposure bracketing.

- **Morphing** (noun): Gradually transforming one image or shape into another.
  - Example: Face morphing creates smooth transitions between images.

### 8. Research and Development
- **Meticulously** (adverb): With careful attention to detail.
  - Example: AI models must be meticulously trained for optimal performance.

- **Layer-wise, sample-wise** (adjective): Applied separately to each layer or to each sample.
  - Example: Neural networks are analyzed layer-wise for better understanding.

- **Preexisting** (adjective): Already present before a particular event or step.
  - Example: Preexisting models can be fine-tuned for specific tasks.

- **Plausible** (adjective): Reasonable or believable in light of the evidence.
  - Example: The system generates plausible reconstructions of 3D scenes.

### 9. Industrial Human-Robot Collaboration
- **Pose Forecasting** (noun phrase): Predicting how the position and orientation of a body or its joints will change.
  - Example: Pose forecasting is crucial for safe human-robot interaction.
- **Ablation** (noun): Removing a component of a model to test its contribution.
  - Example: Ablation studies help understand the contribution of different model components.
- **Endow** (verb): To give someone or something a particular capability.
  - Example: The new sensor endows the robot with better perceptive capabilities.
- **Perceptive** (adjective): Quick to notice or understand something.
  - Example: Perceptive robots can adapt to dynamic environments.
- **Harm** (noun or verb): Damage or injury, or the act of causing it.
  - Example: The primary goal is to prevent any harm to the human worker.
- **Transmission of contact wrenches** (noun phrase): The transfer of forces and moments through a point or surface of contact.
  - Example: Accurate transmission of contact wrenches is vital for haptic feedback.
- **On-the-fly** (adverbial phrase): During operation, as the need arises.
  - Example: The robot can adjust its path on-the-fly to avoid obstacles.
- **Adjacency** (noun): The relationship between neighboring or directly connected elements.
  - Example: Adjacency matrices are used to represent connections in a graph.
- **Sparse** (adjective): Containing few occupied positions or few nonzero entries.
  - Example: Sparse data can be challenging for some machine learning models.
- **Sparsity** (noun): The property of having relatively few nonzero or occupied elements.
  - Example: Sparsity is a desirable property in many high-dimensional datasets.
- **Abide** (verb): To follow a rule or meet a requirement, as in “abide by.”
  - Example: Robots must abide by safety protocols.
- **Genuine** (adjective): Authentic or real.
  - Example: The system aims to achieve genuine collaboration between humans and robots.
- **Foresee** (verb): To anticipate something before it occurs.
  - Example: It is difficult to foresee all possible scenarios in a complex environment.
- **Exploited** (verb (past tense or past participle)): Made use of for a particular purpose.
  - Example: The robot's capabilities were fully exploited in the task.
- **Aspect** (noun): One side or feature of a subject.
  - Example: Safety is a critical aspect of human-robot collaboration.
- **Intersection** (noun): A point, region, or set of elements shared by two or more things.
  - Example: The intersection of AI and robotics has led to many innovations.
- **Prune** (verb): To trim or remove unnecessary parts.
  - Example: Pruning the neural network can reduce its complexity.
- **Factorize** (verb): To express a quantity or matrix as a product of factors.
  - Example: We can factorize the matrix to understand its underlying structure.
- **Adjacency** (noun): The relationship between neighboring or directly connected elements. This term also appears earlier in the list.
  - Example: Adjacency lists are another way to represent graph connections.
- **Spectral** (adjective): Relating to a spectrum, such as a range of wavelengths or eigenvalues.
  - Example: Spectral analysis is used in various sensor technologies.
- **Coarse** (adjective): Approximate or low in detail or resolution.
  - Example: A coarse estimation was made initially, followed by a finer adjustment.
- **Sparsifying** (verb or adjective): Making a representation contain fewer nonzero entries.
  - Example: Sparsifying techniques are used to reduce data dimensionality.

### 10. Modern Artificial Intelligence
- **Formalize** (verb): To express an idea in a precise mathematical or logical form.
  - Example: We need to formalize the problem statement before designing a solution.
- **Density** (noun): The amount of a quantity per unit of space or another measure.
  - Example: Probability density functions describe the likelihood of a continuous variable.
- **PDF (Probability Density Function)** (noun): A function whose integral over a range gives the probability of a continuous variable falling there.
  - Example: The PDF of a normal distribution is bell-shaped.
- **PMF (Probability Mass Function)** (noun): A function that assigns a probability to each possible value of a discrete random variable.
  - Example: The PMF is used for discrete random variables.
- **Accomplish** (verb): To complete a task or achieve a goal.
  - Example: The AI model was able to accomplish the task with high accuracy.
- **Observed** (adjective or past-tense verb): Seen, measured, or recorded.
  - Example: The observed data was used to train the model.
- **Intractable** (adjective): Difficult to handle or computationally impractical to solve.
  - Example: Some problems are computationally intractable.
- **Coefficient** (noun): A factor that multiplies a variable or term.
  - Example: The coefficients of the linear regression model were estimated.
- **Era** (noun): A distinct period of time.
  - Example: We are in the era of big data and artificial intelligence.
- **Deluge** (noun): A flood or an overwhelming influx.
  - Example: Researchers face a deluge of data from various sources.
- **Apparently** (adverb): Seemingly, or as the available evidence suggests.
  - Example: Apparently, the new algorithm outperforms the old one.
- **Sufficient** (adjective): Enough to meet the stated need.
  - Example: Sufficient data is required to train a robust model.
- **Altering** (verb or adjective): Changing or modifying something.
  - Example: Altering the hyperparameters can significantly affect model performance.
- **Ability to fix** (phrase): The capacity to correct a fault or solve a problem.
  - Example: The system has the ability to fix minor errors automatically.
- **Devising** (verb): Developing or designing a method or solution.
  - Example: Devising new algorithms is a key part of AI research.
- **Empirical** (adjective): Based on observation or experiment.
  - Example: Empirical results show the effectiveness of the proposed method.
- **Theorem** (noun): A mathematical or logical statement established by proof.
  - Example: The Bayes' theorem is fundamental in probability theory.
- **Criterion** (noun): A standard for making a judgment. Its plural is “criteria.”
  - Example: Accuracy is a common criterion for evaluating classification models.
- **Impose** (verb): To apply or enforce a condition, rule, or constraint.
  - Example: We can impose constraints on the optimization problem.
- **Regularization** (noun): A technique that penalizes or restricts a model to reduce overfitting.
  - Example: Regularization helps prevent overfitting in machine learning models.
- **Implicitly** (adverb): In a way that is implied or learned without being stated directly.
  - Example: The model implicitly learns features from the data.
- **Explicitly** (adverb): In a way that is stated directly and clearly.
  - Example: Some parameters need to be explicitly defined.
- **Preferences** (noun): Choices or outcomes that someone favors over others.
  - Example: The recommendation system learns user preferences over time.
- **Validation** (noun): Checking whether a result or a model meets the intended requirements.
  - Example: Cross-validation is used to assess model performance.
- **Problematic** (adjective): Likely to cause difficulties or raise concerns.
  - Example: Handling missing data can be problematic.
- **Associate** (verb): To connect one thing with another.
  - Example: The goal is to associate input features with output labels.
- **Evaluations** (noun): Assessments of quality, performance, or effectiveness.
  - Example: Multiple evaluations were conducted to ensure robustness.
- **Converge** (verb): To approach a common point or a limiting value.
  - Example: The optimization algorithm should converge to a good solution.
- **Convex** (adjective): Describing a set containing the segment between any two of its points, or a function whose graph lies below its chords.
  - Example: Convex optimization problems are generally easier to solve.

## Writing Technical Papers
- **Inventing** (verb): Creating or developing something new.
  - Example: Inventing new algorithms for efficient image processing.

- **Revising** (verb): Editing or reworking an existing text or design.
  - Example: Revising the methodology section of the research paper.

- **Drafting** (verb): Writing an initial version.
  - Example: Drafting the experimental results section.

### 11. Mathematics, Linear Algebra, Probability, and Machine Learning

- **Vector**: A mathematical object with magnitude and direction, commonly represented by an ordered list of numbers.
- **Matrix**: A rectangular array of numbers arranged in rows and columns.
- **Inner Product (Dot Product)**: An operation on two vectors that produces a scalar and can measure their alignment or similarity.
- **Outer Product**: An operation that multiplies a column vector by a row vector to produce a matrix.
- **Matrix-Vector Product**: Multiplying a matrix by a vector produces a vector, a linear combination of the columns of the matrix.
- **Matrix-Matrix Product**: Multiplying two matrices of compatible dimensions to obtain another matrix.
- **Identity Matrix**: A square matrix with ones on its main diagonal and zeros elsewhere. It acts as the multiplicative identity.
- **Diagonal Matrix**: A square matrix whose entries off the main diagonal are zero.
- **Transpose**: The matrix obtained by exchanging rows and columns, written Aᵀ.
- **Symmetric Matrix**: A square matrix equal to its transpose, A = Aᵀ.
- **Trace**: The sum of the entries on the main diagonal of a square matrix, written tr(A).
- **Norm**: A function that measures the size of a vector or matrix. Examples include the L1, L2, infinity, and Frobenius norms.
- **Linear Independence**: The property that no vector in a collection can be written as a linear combination of the others.
- **Rank**: The maximum number of linearly independent rows or columns of a matrix. It gives the dimension of its image.
- **Invertible (Non-singular) Matrix**: A square matrix for which an inverse exists.
- **Inverse Matrix**: The unique matrix A⁻¹ that gives the identity when multiplied by A on either side.
- **Orthogonal Vectors**: Two vectors whose inner product is zero. In Euclidean space their directions are perpendicular.
- **Normalized Vector**: A vector scaled to have an L2 norm of one.
- **Orthogonal Matrix**: A real square matrix U with orthonormal columns, so UᵀU = UUᵀ = I and its inverse equals its transpose.
- **Determinant**: A scalar for a square matrix whose magnitude gives the volume scale factor of its linear transformation. It is zero for a singular matrix.
- **Quadratic Form**: A scalar expression of the form xᵀAx, where A is square and x is a vector.
- **Positive Definite (PD) Matrix**: A real symmetric matrix A for which xᵀAx > 0 for every nonzero vector x.
- **Positive Semidefinite (PSD) Matrix**: A real symmetric matrix A for which xᵀAx ≥ 0 for every vector x.
- **Eigenvalue**: A scalar λ for which Ax = λx for some nonzero vector x. Multiplying by A scales that vector by λ.
- **Eigenvector**: A nonzero vector x satisfying Ax = λx for its associated eigenvalue λ.
- **Gradient**: The vector of first partial derivatives, ∇f(x). It points in the direction of steepest increase when it is nonzero.
- **Hessian**: The matrix of second partial derivatives, ∇²f(x). It describes local curvature and helps assess convexity or concavity.
- **Random Variable**: A function that assigns a numerical value to each outcome of an experiment.
- **Cumulative Distribution Function (CDF)**: The probability that X is at most x, written F_X(x) = P(X ≤ x).
- **Probability Density Function (PDF)**: A function describing an absolutely continuous distribution. Where the derivative exists, p_X(x) = dF_X(x)/dx.
- **Independent Random Variables**: Variables whose joint distribution factors into the product of their marginal distributions.
- **Expected Value (Mean)**: The average under the probability distribution. For a continuous variable, E[X] = ∫ x p_X(x) dx when the expectation exists.
- **Variance**: A measure of dispersion around the mean, Var(X) = E[|X − E[X]|²].
- **Correlation**: A measure of association between two random variables. In the signal-processing convention used here, the uncentered correlation is E[XY*], where * denotes complex conjugation.
- **Covariance**: A measure of how two variables vary together, Cov(X,Y) = E[(X − E[X])(Y − E[Y])*].
- **Random Vector**: A vector whose entries are random variables.
- **Multivariate Gaussian (Normal) Distribution**: A joint normal distribution for several variables, specified by a mean vector and a covariance matrix.
- **Jointly Gaussian Random Vector**: A random vector for which every linear combination of its entries is Gaussian. Gaussian marginal distributions alone do not guarantee this property.
- **Random Process**: A family of random variables indexed by time or space. This guide considers processes on a two-dimensional discrete spatial grid.
- **Power Spectrum (Power Spectral Density)**: The discrete-space Fourier transform of the autocorrelation of a wide-sense stationary random process. It describes how power is distributed across spatial frequencies.
- **Loss Function**: A function L(D(x), y) that measures the discrepancy between a model prediction D(x) and a target y.
- **Supervised Learning**: Training a model on examples that pair inputs x with known targets y.
- **Empirical Loss Function**: The average or sum of losses on observed training samples, used to approximate loss under the data distribution.
- **Gradient Descent**: An optimization method that moves in the direction of the negative gradient to seek a local minimum.
- **Learning Rate (Step Size)**: The factor that scales the gradient at each update and therefore controls the size of the step.
- **Stochastic Gradient Descent (SGD)**: An optimization method that updates parameters using a gradient estimated from a randomly sampled example or mini-batch.
- **Batch Size**: The number of examples used for each parameter update in mini-batch training.
- **Local Minimum**: A point whose function value is no greater than the values at nearby points. A zero gradient and a positive definite Hessian give a sufficient condition for a strict local minimum.
- **Overfitting**: Fitting the training data so closely that performance on new data suffers.
- **Underfitting**: Failing to capture the underlying pattern, resulting in poor performance on both training and test data.
- **Regularization**: A modification to the learning procedure that discourages overfitting and can improve generalization.
- **No Free Lunch Theorem**: A result showing that no single learning algorithm performs best across all possible problems without assumptions about the problems.
- **Cross-Validation**: Estimating generalization by splitting data into folds and rotating which folds are used for training and evaluation.
- **Classification**: Assigning an input to one of a predefined set of classes.
- **Regression**: Predicting a continuous numerical output from input data.
- **Density Estimation**: Modeling or estimating the probability distribution of observed data.
- **Object Detection**: Locating objects in an image or video and identifying their classes, often combining localization by regression with classification.
- **Self-Supervised Learning**: Training on a signal constructed from the input data itself, without manually supplied target labels.

</div>
