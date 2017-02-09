from scipy import misc
import copy
import numpy as np
# from squeezenet import get_squeezenet

# model = get_squeezenet(1000, dim_ordering='tf')
# model.compile(loss="categorical_crossentropy", optimizer="adam")
# model.load_weights('../model/squeezenet_weights_tf_dim_ordering_tf_kernels.h5', by_name=True)

# read and prepare image input
im = misc.imread('cat.jpeg')
im = misc.imresize(im, (227, 227)).astype(np.float32)
aux = copy.copy(im)
im[:, :, 0] = aux[:, :, 2]
im[:, :, 2] = aux[:, :, 0]

# Remove image mean
im[:, :, 0] -= 104.006
im[:, :, 1] -= 116.669
im[:, :, 2] -= 122.679
# im = np.expand_dims(im, axis=0)

print im

bytearr = im.astype(np.float32)


shape = 'x'.join(str(x) for x in list(im.shape))
# weight = weight_name[len(layer_name)+1:].split(":")[0]

name = 'cat-' + shape

# meta['type'] = 'float32'
# self.metadata.append(meta)
# offset += len(bytearr)
bytearr.tofile(name)