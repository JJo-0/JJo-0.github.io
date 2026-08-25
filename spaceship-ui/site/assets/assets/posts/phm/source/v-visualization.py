#################################################
# Visualization
#################################################

import numpy as np
import pandas as pd
from urlib.request import urlopen
import json

import plotly.io as pio
import plotly.express as px
import plotly.graph_objects as go
import plotly.figure_factory as ff
from plotly.subplots import make_subplots
from plotly.validators.scatter.marker import SymbolValidator

## 산점도
iris = px.data.iris()

