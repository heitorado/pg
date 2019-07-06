import cv2
import numpy as np

### Global stuff ###
# Lê as matrizes de câmera e de distorção, que vem da calibração (e podem ser 'regeradas' calibrando novamente):
mtx  = np.loadtxt("camera_matrix")
dist = np.loadtxt("distortion_matrix")

# Carrega a imagem que será rastreada pelo PLANAR TRACKING
imageToTrack = cv2.imread('planarTracking/korra.jpg', -1)

# Inicializa detector ORB
orb = cv2.ORB_create()

def main():
    # Inicializa câmera
    cap = cv2.VideoCapture(0)

    while(cap.isOpened()):
        ret, frame = cap.read()

        if ret:
            frame = loadCameraSettings(frame)

            frame = poseEstimation(frame)

            # Mostra imagem frame a frame, após todos os tratamentos anteriores
            cv2.imshow('Projeto PG', frame)

            # Escuta input do usuário
            '''
                c - Iniciar calibração
                p - exibir rastreamento planar da imagem atual
                q - Sair
            '''
            key = cv2.waitKey(1) & 0xFF  
            if key == ord('c'):
                print("calibration starting...")
                print("15 photos of the chessboard will be taken.\n Press the 'n' key when ready to take photo until all the photos are taken.")
                calibrate(cap)
                print("calibration done...")
            elif key == ord('p'):
                planarTracking2(orb, imageToTrack, frame, "DEBUG")
            elif key == ord('q'):
                break
        else:
            break

    cap.release()
    cv2.destroyAllWindows()

def poseEstimation(frame):
    obj_points, frame_points = planarTracking2(orb, imageToTrack, frame)

    ret, rvec, tvec = cv2.solvePnP(obj_points, frame_points, mtx, dist)

    # Obtem os pontos 3D q contornam a imagem original object
    h, w = imageToTrack.shape[:2]
    original_image_rectangle_points = np.array([[0,0,1],[w,0,1], [w,h,1], [0,h,1]], np.float32)

    w = w/3
    h = h/3
    cubeaxis = np.float32([[0,0,0], [0,h,0], [w,h,0], [w,0,0],
                        [0,0,w*(-1)],[0,h,w*(-1)],[w,h,w*(-1)],[w,0,w*(-1)] ])

    # project 3D points to image plane - bounding box
    bbpts, jac = cv2.projectPoints(original_image_rectangle_points, rvec, tvec, mtx, dist)

    # Desenha bounding box ao redor do objeto
    frame = drawBoundingRectangle(frame, bbpts)

    # project 3D points to image plane - cube
    cbpts, jac = cv2.projectPoints(cubeaxis, rvec, tvec, mtx, dist)

    # Desenha cubo em cima do objeto
    frame = drawCube(frame, cbpts)

    return frame

def drawBoundingRectangle(img, imgpts):
    pts = np.int32(imgpts).reshape((-1,1,2))
    for p in pts:
        if((p[0][0]) < 0 or (p[0][1]) < 0):
            return img

    img = cv2.polylines(img, [pts], True, (242, 242, 80), 2)

    return img

def drawCube(img, imgpts):
    pts = np.int32(imgpts).reshape((-1,1,2))

    # draw ground floor in green
    img = cv2.drawContours(img, [pts[:4]],-1,(0,255,0),-3)

    # draw pillars in blue color
    for i,j in zip(range(4),range(4,8)):
        img = cv2.line(img, tuple(pts[i][0]), tuple(pts[j][0]),(255,0,0),3)

    # draw top layer in red color
    img = cv2.drawContours(img, [pts[4:]],-1,(0,0,255),3)

    return img

def loadCameraSettings(frame):
    h, w = frame.shape[:2]
    newCameraMtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (w,h), 1, (w,h))

    # des-distorcendo (?)
    dst = cv2.undistort(frame, mtx, dist, None, newCameraMtx)

    # corta e mostra imagem
    x, y, w, h = roi
    dst = dst[y:y+h, x:x+w]

    return dst

def calibrate(cap):
    # checkerboard Dimensions
    cbcol = 15
    cbrow = 10

    # termination criteria
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)

    # prepare object points, like (0,0,0), (1,0,0), (2,0,0) ....,(6,5,0)
    objp = np.zeros((cbrow * cbcol, 3), np.float32)
    objp[:,:2] = np.mgrid[0:cbcol,0:cbrow].T.reshape(-1,2)

    # Arrays to store object points and image points from all the images.
    objpoints = [] # 3d point in real world space
    imgpoints = [] # 2d points in image plane.

    capturedFramesCount = 0

    while(cap.isOpened()):
        # le o frame atual e coloca em grayscale
        ret, frame = cap.read()

        if(ret):
            # mostra os frame em real time
            grayScaleFrame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            cv2.imshow('frame', grayScaleFrame)

            # espera o usuario dizer que quer capturar o frame
            if cv2.waitKey(1) & 0xFF == ord('n'):
                if(capturedFramesCount == 14):
                    cv2.destroyWindow('img')
                    break

                capturedFrame = grayScaleFrame

                # Encontra os cantos do chessboard
                ret, corners = cv2.findChessboardCorners(grayScaleFrame, (cbcol, cbrow), None)

                # If found, add object points, image points (after refining them)
                if ret == True:
                    # Só conta aqui porque a foto pode não ser válida
                    capturedFramesCount = capturedFramesCount + 1

                    objpoints.append(objp)

                    corners2 = cv2.cornerSubPix(grayScaleFrame,corners,(11,11),(-1,-1),criteria)
                    imgpoints.append(corners2)

                    # Draw and display the corners
                    cv2.drawChessboardCorners(frame, (cbcol, cbrow), corners2, ret)
                    cv2.imshow('img', frame)
                    key = ord('w')
                    while(key != ord('x')):
                        key = cv2.waitKey(0) & 0xFF
                    cv2.destroyWindow('img')

    # obtem a matriz da camera, coefiecientes de distorção, vetores de rotação e translação
    # e salva em arquivos .txt para usar posteriormente
    ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(objpoints, imgpoints, grayScaleFrame.shape[::-1], None, None)

    np.savetxt('camera_matrix', mtx)
    np.savetxt('distortion_matrix', dist)
    #np.savetxt('rotation_vectors', rvecs)
    #np.savetxt('translation_vectors', tvecs)

    return

def planarTracking2(orb, referenceImage, frame, option=0):
    kp1, des1 = orb.detectAndCompute(referenceImage, None)
    kp2, des2 = orb.detectAndCompute(frame, None)

    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    # Match descriptors.
    matches = bf.match(des1,des2)
    # Sort them in the order of their distance.
    matches = sorted(matches, key = lambda x:x.distance)

    if(option == "DEBUG"):
        ### DEBUG
        ##### Fonte: https://stackoverflow.com/questions/51606215/how-to-draw-bounding-box-on-best-matches
        good_matches = matches[:100]

        src_pts = np.float32([ kp1[m.queryIdx].pt for m in good_matches ]).reshape(-1,1,2)
        dst_pts = np.float32([ kp2[m.trainIdx].pt for m in good_matches ]).reshape(-1,1,2)
        M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC,5.0)
        matchesMask = mask.ravel().tolist()
        h,w = referenceImage.shape[:2]
        pts = np.float32([ [0,0],[0,h-1],[w-1,h-1],[w-1,0] ]).reshape(-1,1,2)

        dst = cv2.perspectiveTransform(pts,M)

        dst += (w, 0)  # adding offset - só é necessário quando processado o frame em cima de img3 apos rodar o drawMatches, porque fica com a imagem original no lado esquerdo da tela.

        draw_params = dict( matchColor = (0,255,0), #draw matches in green color
                            singlePointColor = None,
                            matchesMask = matchesMask, #draw only inliers
                            flags = 2)

        img3 = cv2.drawMatches(referenceImage,kp1,frame,kp2,good_matches, None,**draw_params)
        img3 = cv2.polylines(img3, [np.int32(dst)], True, (0,0,255),3, cv2.LINE_AA)

        cv2.imshow('Showing matches', img3)
        key = ord('w')
        while(key != ord('x')):
            key = cv2.waitKey(0) & 0xFF
        cv2.destroyWindow('Showing matches')
    else:
        matches_sample = matches[:100]

        src_pts = np.float32([ kp1[m.queryIdx].pt for m in matches_sample ])
        src_pts = np.hstack((src_pts, np.ones((src_pts.shape[0], 1), dtype=src_pts.dtype)))
        dst_pts = np.float32([ kp2[m.trainIdx].pt for m in matches_sample ])

    return src_pts, dst_pts

if __name__ == '__main__':
    main()