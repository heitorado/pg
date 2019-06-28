import cv2
import numpy as np

def main():
    # Lê as matrizes de câmera e de distorção, que vem da calibração:
    mtx = np.loadtxt("camera_matrix")
    dist = np.loadtxt("distortion_matrix")

    # Inicializa câmera
    cap = cv2.VideoCapture(0)

    while(cap.isOpened()):
        ret, frame = cap.read()

        if ret:
            # print(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            # print(cap.get(cv2.CAP_PROP_FRAME_WIDTH))

            #grayScaleFrame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            h, w = frame.shape[:2]
            newCameraMtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (w,h), 1, (w,h))

            # des-distorcendo (?)
            dst = cv2.undistort(frame, mtx, dist, None, newCameraMtx)

            # corta (tem que ver um jeito melhor porque ta ficando muito PEQUENININHO) e mostra imagem
            x, y, w, h = roi
            dst = dst[y:y+h, x:x+w]
            cv2.imshow('frame', dst)  

            if cv2.waitKey(1) & 0xFF == ord('c'):
                print("calibration starting...")
                print("15 photos of the chessboard will be taken.\n Press the 'n' key when ready to take photo until all the photos are taken.")
                calibrate(cap)
                print("calibration done...")


            elif cv2.waitKey(1) & 0xFF == ord('q'):
                break
        else:
            break

    cap.release()
    cv2.destroyAllWindows()


def calibrate(cap):
    # termination criteria
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)

    # prepare object points, like (0,0,0), (1,0,0), (2,0,0) ....,(6,5,0)
    objp = np.zeros((6*7,3), np.float32)
    objp[:,:2] = np.mgrid[0:7,0:6].T.reshape(-1,2)

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
                    break

                capturedFrame = grayScaleFrame

                # Encontra os cantos do chessboard
                ret, corners = cv2.findChessboardCorners(grayScaleFrame, (7,6), None)

                # If found, add object points, image points (after refining them)
                if ret == True:
                    # Só conta aqui porque a foto pode não ser válida
                    capturedFramesCount = capturedFramesCount + 1

                    objpoints.append(objp)

                    corners2 = cv2.cornerSubPix(grayScaleFrame,corners,(11,11),(-1,-1),criteria)
                    imgpoints.append(corners2)

                    # Draw and display the corners
                    cv2.drawChessboardCorners(frame, (7,6), corners2,ret)
                    cv2.imshow('img', frame)
                    cv2.waitKey(0)
                    cv2.destroyWindow('img')

    # obtem a matriz da camera, coefiecientes de distorção, vetores de rotação e translação
    # e salva em arquivos .txt para usar posteriormente
    ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(objpoints, imgpoints, grayScaleFrame.shape[::-1], None, None)

    np.savetxt('camera_matrix', mtx)
    np.savetxt('distortion_matrix', dist)
    #np.savetxt('rotation_vectors', rvecs)
    #np.savetxt('translation_vectors', tvecs)

    return

if __name__ == '__main__':
    main()